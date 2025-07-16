const express = require('express');
const { createEvent, getEvent, registerEvent, cancelRegistration, upcomingEvents, getEventStats } = require('../controllers/eventController');
const router = express.Router();

router.post('/',createEvent)
router.get('/upcoming',upcomingEvents)
router.get('/:id',getEvent)
router.post('/:id/register',registerEvent)
router.delete('/:id/cancel',cancelRegistration)

router.get('/:id/stats',getEventStats)

module.exports = router;