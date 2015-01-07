/**
 * IMPORTANT * IMPORTANT * IMPORTANT * IMPORTANT * IMPORTANT * IMPORTANT *
 *
 * You should never commit this file to a public repository on GitHub!
 * All public code on GitHub can be searched, that means anyone can see your
 * uploaded secrets.js file.
 *
 * I did it for your convenience using "throw away" credentials so that
 * all features could work out of the box.
 *
 * Untrack secrets.js before pushing your code to public GitHub repository:
 *
 * git rm --cached config/secrets.js
 *
 * If you have already commited this file to GitHub with your keys, then
 * refer to https://help.github.com/articles/remove-sensitive-data
*/

module.exports = {

  db: process.env.MONGOHQ || 'mongodb://localhost:27017/gatemaster',

  sessionSecret: process.env.SESSION_SECRET || 'I am a wizard',

  gmail: {
    user: process.env.GMAIL_USER || 'postmaster@sandbox697fcddc09814c6b83718b9fd5d4e5dc.mailgun.org',
    password: process.env.GMAIL_PASSWORD || '29eldds1uri6'
  },

  twilio: {
    sid: process.env.TWILIO_SID || 'ACcc464743f64498ac6a7c231022c01e9c',
    token: process.env.TWILIO_TOKEN || '20246486eff6b593c8d23c8812dbb084'
  }
};
