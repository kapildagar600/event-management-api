//
const pool = require("../models/db");
const {z} = require('zod');
const { eventSchema, registerSchema, cancelSchema } = require("../validators/validationController");
exports.createEvent = async (req, res) => {
   const eventSchemaResult = eventSchema.safeParse(req.body);
        if(!eventSchemaResult.success){
            return res.status(400).json({message:"Invalid Input"})
        }
  const { title, datetime, location, capacity } = req.body;

  if (!title || !datetime || !location || !capacity) {
    return res.status(400).json({ message: "Fill all Fields" });
  }

  if (capacity <= 0 || capacity > 1000) {
    return res
      .status(400)
      .json({ message: "Invalid Capacity! Must be between 1 and 1000" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO events (title, datetime, location, capacity) VALUES ($1, $2, $3, $4) RETURNING id",
      [title, datetime, location, capacity]
    );
    res.status(200).json({ eventId: result.rows[0].id });
  } catch (error) {
    console.error("Error in creating Event: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getEvent = async (req, res) => {
  const eventId = req.params.id;
  try {
    const eventResult = await pool.query("SELECT * FROM events WHERE id=$1", [
      eventId,
    ]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = eventResult.rows[0];

    const registeredUsers = await pool.query(
      `SELECT users.id,users.name,users.email FROM registrations JOIN users ON registrations.user_id = users.id WHERE registrations.event_id = $1`,
      [eventId]
    );

    const users = registeredUsers.rows;
    res.status(200).json({
      event,
      users,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.registerEvent = async (req, res) => {
  const registerSchemaResult = registerSchema.safeParse(req.body);
  if(!registerSchemaResult.success){
     return res.status(400).json({
      message: "Validation failed",
      errors: registerSchemaResult.error.issues.map(issue => ({
        field: issue.path?.[0],
        message: issue.message
      }))
    });
  }
  const eventId = req.params.id;
  const { name, email } = req.body;
  try {
    const eventResult = await pool.query("SELECT * FROM events WHERE id=$1", [
      eventId,
    ]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event Not found" });
    }
    const event = eventResult.rows[0];

    if (new Date(event.datetime) < new Date()) {
      return res
        .status(400)
        .json({ message: "Can't Register - Event Already done!" });
    }
    const regCount = await pool.query(
      "SELECT COUNT(*) FROM registrations WHERE event_id = $1",
      [eventId]
    );
    const totalReg = parseInt(regCount.rows[0].count);
    if (totalReg >= event.capacity) {
      return res
        .status(400)
        .json({ message: "can't register - event is full" });
    }
    const userResult = await pool.query("SELECT id FROM users WHERE email=$1", [
      email,
    ]);
    let userId;
    if (userResult.rows.length === 0) {
      const newUser = await pool.query(
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
        [name, email]
      );
      userId = newUser.rows[0].id;
    }else{
        userId = userResult.rows[0].id;
    }
    const userRegisteredCheck = await pool.query(
      "SELECT * FROM registrations WHERE event_id=$1 AND user_id=$2",
      [eventId, userId]
    );
    if (userRegisteredCheck.rows.length>0) {
      return res.status(400).json({ message: "You have already registered" });
    }
     await pool.query(
      "INSERT INTO registrations (user_id,event_id) VALUES ($1,$2) ",
      [userId, eventId]
    );
    res.status(200).json({ message: "User Registered for Event", userId,eventId });
  } catch (error) {
    console.error("Error in registartion : ", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.cancelRegistration = async (req,res)=>{
    
    const cancelResult = cancelSchema.safeParse(req.body);
    if(!cancelResult.success){
      return res.status(400)
      .json({
        message:"Validation failed",
      errors:cancelResult.error.issues.map(issue=>({
        field:issue.path?.[0],
        message:issue.message
      }))
      })

    }
    const eventId = req.params.id;
    const {email} = req.body;
    try {
        const userResult = await pool.query(
            "SELECT id FROM users WHERE email=$1",
            [email]
        )
        if(userResult.rows.length===0){
            return res.status(400).json({message: "User not found"})
        }
        const userId = userResult.rows[0].id;

        const regResult = await pool.query(
            "SELECT * FROM registrations WHERE user_id=$1 AND event_id=$2",
            [userId,eventId]
        )
        if(regResult.rows.length===0){
           return res.status(400).json({message: "User has not registered in event"})  
        }
        await pool.query(
            "DELETE FROM registrations WHERE event_id=$1 AND user_id=$2",
            [eventId,userId]
        )
        res.status(200).json({message:"Registration cancelled!",
            userId,
            eventId
        })
    } catch (error) {
        console.error("Error cancelling registration:", error);
        res.status(500).json({ message: "Server Error" });
    }
}
exports.upcomingEvents = async(req,res)=>{
    try {
        const result = await pool.query(
            `SELECT * FROM events WHERE datetime > NOW() ORDER BY datetime ASC, location ASC`
        )
        res.status(200).json({upcomingEvents:result.rows})
    } catch (error) {
           console.error("Error fetching upcoming events:", error);
           res.status(500).json({ message: "Server Error" });
    }
}
exports.getEventStats = async(req,res)=>{
    const eventId = req.params.id;
    try {
        const eventResult = await pool.query(
            "SELECT * FROM events WHERE id=$1",
            [eventId]
        )
        if(eventResult.rows.length===0){
            return res.status(404).json({message:"Event not found"})
        }
        const event = eventResult.rows[0];
        const regResult = await pool.query(
            "SELECT COUNT(*) FROM registrations WHERE event_id=$1",
            [eventId]
        )
        const totalReg = parseInt(regResult.rows[0].count);
        const remCapacity = event.capacity-totalReg;
        const percentageUsed = ((totalReg/event.capacity)*100).toFixed(2)
        res.status(200).json({
            eventId:event.id,
            title:event.title,
            totalReg,
            remCapacity,
            percentageUsed:`${percentageUsed}%`
        })
    } catch (error) {
    console.error("Error fetching event stats:", error);
    res.status(500).json({ message: "Server Error" });
    }
}