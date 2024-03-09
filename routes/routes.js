const express = require('express');
const router = express.Router();
const Team = require('../models/team.js');
const Point = require('../models/pointSystem.js');

// POST /addTeam route
router.post('/addTeam', async (req, res) => {
  const { teamName, teamWon, teamLost, teamDraw, teamPenalty } = req.body;

  if (!teamName || !teamWon || !teamLost || !teamDraw) {
    return res.json({
      message: 'All fields are required',
      type: 'danger',
    });
  }

  if (
    isNaN(teamWon) ||
    isNaN(teamLost) ||
    isNaN(teamDraw) ||
    isNaN(teamPenalty)
  ) {
    return res.json({
      message: 'Team scores must be numbers',
      type: 'danger',
    });
  }

  const team = new Team({
    teamName,
    teamWon: Number(teamWon),
    teamLost: Number(teamLost),
    teamDraw: Number(teamDraw),
    teamPenalty: Number(teamPenalty),
  });

  const point = await Point.findOne();
  if (point == null) {
    return res.json({
      message: 'Point system not found',
      type: 'danger',
    });
  }

  team.teamTotalMatch = team.teamWon + team.teamLost + team.teamDraw;

  // team.teamPoints = team.teamWon * point.wonPoint + team.teamDraw * point.drawPoint - team.teamPenalty;
  team.teamPoints =
    team.teamWon * point.wonPoint +
    team.teamDraw * point.drawPoint -
    team.teamPenalty;
  team.teamWinPercentage = parseFloat(
    (team.teamPoints * 100) / (team.teamTotalMatch * point.wonPoint)
  ).toFixed(2);

  team
    .save()
    .then(() => {
      req.session.message = {
        type: 'success',
        message: 'Team added successfully',
      };
      console.log(`Team ${team.teamName} added successfully`);
      res.redirect('/');
    })
    .catch((err) => {
      res.json({
        message: err.message,
        type: 'danger',
      });
      console.log('Error while adding team');
    });
});

router.post('/addPoint', (req, res) => {
  const { wonPoint, drawPoint } = req.body;

  if (!wonPoint || !drawPoint) {
    return res.json({
      message: 'All fields are required',
      type: 'danger',
    });
  }

  if (isNaN(wonPoint) || isNaN(drawPoint)) {
    return res.json({
      message: 'Points must be numbers',
      type: 'danger',
    });
  }

  const point = new Point({
    wonPoint: Number(wonPoint),
    drawPoint: Number(drawPoint),
  });

  point
    .save()
    .then(() => {
      req.session.message = {
        type: 'success',
        message: 'Points added successfully',
      };
      console.log(`Points added successfully`);
      res.redirect('/');
    })
    .catch((err) => {
      res.json({
        message: err.message,
        type: 'danger',
      });
      console.log('Error while adding points');
    });
});

// GET / route
router.get('/', (req, res) => {
  Team.find()
    .sort({ teamWinPercentage: -1 })
    .exec()
    .then((teams) => {
      res.render('index', { title: 'Home', teams: teams });
    })
    .catch((err) => {
      res.json({
        message: err.message,
        type: 'danger',
      });
    });
});

router.get('/addTeam', (req, res) => {
  res.render('addTeam', { title: 'AddTeam' });
});

router.get('/addPoint', (req, res) => {
  res.render('addPoint', { title: 'AddPoint' });
});

// Update point Route
router.get('/updatePoint', async (req, res) => {
  try {
    const point = await Point.findOne();
    if (point == null) {
      res.redirect('/');
    } else {
      res.render('updatePoint', { title: 'Update Point', point: point });
    }
  } catch (err) {
    console.log(err);
    res.render('/');
  }
});

router.post('/updatePoint', async (req, res) => {
  const { wonPoint, drawPoint } = req.body;

  if (!wonPoint || !drawPoint) {
    return res.json({
      message: 'All fields are required',
      type: 'danger',
    });
  }

  if (isNaN(wonPoint) || isNaN(drawPoint)) {
    return res.json({
      message: 'Points must be numbers',
      type: 'danger',
    });
  }

  try {
    const point = await Point.findOne();
    point.wonPoint = Number(wonPoint);
    point.drawPoint = Number(drawPoint);
    await point.save();

    // Recalculate team points for all teams
    const teams = await Team.find();
    for (let team of teams) {
      team.teamPoints =
        team.teamWon * point.wonPoint +
        team.teamDraw * point.drawPoint -
        team.teamPenalty;
      team.teamWinPercentage = parseFloat(
        (team.teamPoints * 100) / (team.teamTotalMatch * point.wonPoint)
      ).toFixed(2);
      await team.save();
    }

    req.session.message = {
      type: 'success',
      message: 'Points updated successfully',
    };
    console.log(`Points updated successfully`);
    res.redirect('/');
  } catch (err) {
    res.json({
      message: err.message,
      type: 'danger',
    });
    console.log('Error while updating points');
  }
});

// Update team Route
router.get('/updateTeam/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const team = await Team.findById(id);
    if (team == null) {
      res.redirect('/');
    } else {
      res.render('updateTeam', { title: 'Update Team', team: team });
    }
  } catch (err) {
    console.log(err);
    res.render('/');
  }
});

// Update team Route
router.post('/updateTeam/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { teamName, teamWon, teamLost, teamDraw, teamPenalty } = req.body;

    if (!teamName || !teamWon || !teamLost || !teamDraw) {
      return res.json({
        message: 'All fields are required',
        type: 'danger',
      });
    }

    if (
      isNaN(teamWon) ||
      isNaN(teamLost) ||
      isNaN(teamDraw) ||
      isNaN(teamPenalty)
    ) {
      return res.json({
        message: 'Team scores must be numbers',
        type: 'danger',
      });
    }

    const team = await Team.findById(id);
    if (team == null) {
      return res.redirect('/');
    }

    const point = await Point.findOne();
    if (point == null) {
      return res.json({
        message: 'Point system not found',
        type: 'danger',
      });
    }

    team.teamName = teamName;
    team.teamWon = Number(teamWon);
    team.teamLost = Number(teamLost);
    team.teamDraw = Number(teamDraw);
    team.teamPenalty = Number(teamPenalty);

    team.teamTotalMatch = team.teamWon + team.teamLost + team.teamDraw;
    team.teamPoints =
      team.teamWon * point.wonPoint +
      team.teamDraw * point.drawPoint -
      team.teamPenalty;
    team.teamWinPercentage = parseFloat(
      (team.teamPoints * 100) / (team.teamTotalMatch * point.wonPoint)
    ).toFixed(2);

    await team.save();

    req.session.message = {
      type: 'success',
      message: 'Team updated successfully',
    };
    console.log(`Team ${team.teamName} updated successfully`);
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// Delete team Route
router.get('/deleteTeam/:id', (req, res) => {
  let id = req.params.id;
  Team.findByIdAndDelete(id)
    .then(() => {
      req.session.message = {
        type: 'success',
        message: 'Team deleted successfully',
      };
      console.log(`Team deleted successfully`);
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/');
    });
});

module.exports = router;
