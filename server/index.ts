import express from 'express';
import bodyParser = require('body-parser');
import { tempData } from './temp-data';

import fs from 'fs';

const app = express();

const PORT = 3232;

const PAGE_SIZE = 20;

app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

/* GET Request - optional fields-
 * Params - 'page' - request a specific page, 'search' - searching a word.
 * Body - 'priority' - search ticket with 'low'/'high'/'none' priority.
 */
app.get('/api/tickets', (req, res) => {
  var paginatedData = tempData;

  const page = req.query.page || 1;

  if (req.query && req.query.priority && req.query.priority != 'all') {
    paginatedData = paginatedData.filter(
      (t) => t.priority === req.query.priority
    );
  }

  if (req.query.search) {
    const searchWord = String(req.query.search).toLocaleLowerCase();
    paginatedData = paginatedData.filter((t) => {
      let labels = '';
      t.labels?.forEach((l) => (labels = labels + l));
      return (
        t.title.toLocaleLowerCase() +
        t.content.toLocaleLowerCase() +
        t.userEmail.toLocaleLowerCase() +
        labels.toLocaleLowerCase()
      ).includes(searchWord);
    });

    const results = paginatedData.length;
    const pages = Math.ceil(results / PAGE_SIZE);
    paginatedData = paginatedData.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );
    res.send({
      tickets: paginatedData,
      pagesNumber: pages,
      overallResults: results,
    });
  } else {
    const results = paginatedData.length;
    paginatedData = paginatedData.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );
    const pages = Math.ceil(results / PAGE_SIZE);
    res.send({
      tickets: paginatedData,
      pagesNumber: pages,
      overallResults: results,
    });
  }
});

/* PUT Request - mandatory fields-
 * Body - 'ticketId' - ticket id, 'priority' - update ticket priority with 'low'/'high'/'none'.
 */
app.put('/api/tickets/changePriority', (req, res) => {

  // Priorities: high, low, none;
  if (req.body && req.body.ticketId && req.body.priority) {
    const file = fs.readFileSync('./data.json', { encoding: 'utf8' });
    const data = JSON.parse(file);
    data.map((t: { id: string; priority: string }) => {
      if (t.id == req.body.ticketId) return (t.priority = req.body.priority);
    });

    let updatedData = JSON.stringify(data);
    fs.writeFileSync('./data.json', updatedData);

    res.status(200);
  } else {
    res.status(400);
  }
  res.send("OK");
});

app.listen(PORT);
console.log('server running', PORT);
