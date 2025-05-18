const fs = require('fs');
const path = require('path');
const https = require('https');

const teams = [
  '4AM',
  '17GAMING',
  'BBL',
  'BIG',
  'DWG',
  'ENCE',
  'FAZE',
  'FUT',
  'GEN.G',
  'HEROIC',
  'LIQUID',
  'NAVI',
  'S2G',
  'SQ',
  'TSM',
  'VP'
];

const logosDir = path.join(__dirname, '../public/logos');

if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

teams.forEach(team => {
  const logoUrl = `https://liquipedia.net/commons/images/${team.toLowerCase()}_logo.png`;
  const logoPath = path.join(logosDir, `${team.toLowerCase()}.png`);

  https.get(logoUrl, (response) => {
    if (response.statusCode === 200) {
      const file = fs.createWriteStream(logoPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded logo for ${team}`);
      });
    } else {
      console.log(`Failed to download logo for ${team}`);
    }
  }).on('error', (err) => {
    console.log(`Error downloading logo for ${team}: ${err.message}`);
  });
}); 