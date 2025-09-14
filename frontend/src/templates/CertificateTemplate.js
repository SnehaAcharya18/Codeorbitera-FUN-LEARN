module.exports = ({ name, score, date }) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: 'Arial'; text-align: center; padding: 50px; }
          .certificate {
            border: 10px solid #6666ff;
            padding: 50px;
            border-radius: 20px;
            background: #f8f8ff;
          }
          h1 { font-size: 48px; color: #3333cc; }
          p { font-size: 20px; }
          .score { font-size: 26px; font-weight: bold; color: #444; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>Certificate of Completion</h1>
          <p>This certifies that</p>
          <h2>${name}</h2>
          <p>has successfully completed the course</p>
          <p class="score">Score: ${score}</p>
          <p>Date: ${new Date(date).toDateString()}</p>
        </div>
      </body>
    </html>
  `;
};
