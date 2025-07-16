const {z} = require('zod')

exports.eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  datetime: z.coerce.date().refine(date => date > new Date(), {
    message: "Event date must be in the future"
  }),
  location: z.string().min(1, "Location is required").max(200, "Location too long"),
  capacity: z.number().int().positive().max(1000, "Capacity must be 1000 or less")
});

exports.registerSchema = z.object({
    ename: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),
  email: z.string()
    .email("Invalid email format")
    .max(100, "Email too long")
})
exports.cancelSchema = z.object({
    email: z.string()
    .email("Invalid email format")
    .max(100, "Email too long")
})