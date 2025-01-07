<h1 align="center">Hobbinder: Connect Through Hobbies 🌟</h1>
<p align="center">
  <b>Hobbinder</b> is an innovative mobile app designed to connect people through shared interests and events. Using advanced algorithms, it helps users discover and participate in activities aligned with their hobbies and preferences.
</p>

---

<h2>📋 Key Features</h2>

<ul>
  <li><b>Smart Event Discovery</b><br>
        &emsp;Intuitive swipe interface:<br>
      <ul>
        <li>Swipe <b>right</b> for interested</li>
        <li>Swipe <b>left</b> for not interested</li>
      </ul>
  </li>
  <li><b>Location-Based Matching</b><br>
        &emsp;Finds events near you based on proximity.
  </li>
  <li><b>User Profiles</b><br>
        &emsp;Showcase your:
      <ul>
        <li>Hobbies</li>
        <li>Interests</li>
        <li>Personal summaries</li>
      </ul>
  </li>
  <li><b>Advanced Matching Algorithm</b><br>
        &emsp;Considers multiple factors:
      <ul>
        <li>🌍 Geographic distance</li>
        <li>📊 User engagement history</li>
        <li>🤝 Common interests and hobbies</li>
        <li>📅 User activity patterns and preferences</li>
      </ul>
  </li>
</ul>

---

<h2>🌟 Core Functionalities</h2>

<h3>1. Event Creation</h3>
<ul>
  <li>Create and host events.</li>
  <li>Add event details, location, time, and category.</li>
  <li>Upload images and descriptions.</li>
</ul>

<h3>2. Event Discovery</h3>
<ul>
  <li>Explore nearby events with a <b>card-based interface</b>.</li>
  <li>Each card displays event details, host information, and location.</li>
  <li>Use interactive swipe mechanics for easy navigation.</li>
</ul>

<h3>3. User Engagement</h3>
<ul>
  <li>Customize your profile with photos and personal information.</li>
  <li>Select hobbies and match interests.</li>
  <li>Location-based services suggest relevant events.</li>
</ul>

<h3>4. Matching System</h3>
<ul>
  <li>Event preferences</li>
  <li>Geographic proximity</li>
  <li>Interest alignment</li>
  <li>Time availability</li>
  <li>Social compatibility</li>
</ul>

<h3>5. Real-Time Interactions</h3>
<ul>
  <li>Get instant notifications for matches.</li>
  <li>Stay updated on event changes.</li>
  <li>Track user interactions.</li>
</ul>

---

<h2>🔧 Technical Stack</h2>

<ul>
  <li><b>Frontend:</b> React Native</li>
  <li><b>Backend:</b> Node.js with Express</li>
  <li><b>Database:</b> MongoDB</li>
  <li><b>Authentication:</b> JWT</li>
  <li><b>Location Services:</b> Google Places API</li>
  <li><b>Matching Algorithm:</b> TensorFlow.js</li>
</ul>

---

<h2>🎯 Target Audience</h2>

<p>Hobbinder is perfect for:</p>
<ul>
  <li>People exploring new hobbies</li>
  <li>Those seeking like-minded friends</li>
  <li>Event organizers and community builders</li>
  <li>Hobby enthusiasts sharing passions</li>
  <li>Newcomers seeking local connections</li>
</ul>

---

<h2>💡 Unique Value Proposition</h2>

<p><b>Hobbinder</b> focuses on <b>activity-based connections</b>, prioritizing real-world interactions over traditional social networking. Build genuine relationships through shared experiences!</p>

---

<h2>🚀 How to Run the Project</h2>

<ol>
  <li><b>Set Up Environment Variables</b><br>
      Find your IP address by running <code>ifconfig</code> in the terminal.<br>
      Update the IP address in the <code>.env</code> file.
  </li>
  <li><b>Install Dependencies</b><br>
      To install required packages, run <code>npm install</code> from server and from client sperately.<br>
      If needed, install specific dependencies listed in <code>package.json</code>.
  </li>
  <li><b>Create the machine-learning file for matching algorithms</b><br>
      It's not a must, but it's possible to run <code>cd server/ml</code>, then <code>node trainMode.js</code>.<br>
      That will create new bin and json files at 'ml/trained-model', which will be the new model and weights for our matching algorithm.
  </li>
  <li><b>Run the Server</b><br>
      Navigate to the <code>server</code> directory:
      <pre><code>cd server
npm run dev</code></pre>
      Ensure <b>nodemon</b> is installed.
  </li>
  <li><b>Run the Client</b><br>
      Navigate to the <code>AuthApp</code> directory:
      <pre><code>cd AuthApp
npm start</code></pre>
      If IP changes cause issues, try:
      <pre><code>npm start -- -c</code></pre>
  </li>
  <li><b>Test on Mobile</b><br>
      Open the Expo app on your phone.<br>
      Scan the QR code to run the client.<br>
      Alternatively, use an emulator on your computer.
  </li>
</ol>

---

**In order to run the project, you need some configuration files which are saved safely at my protected .env and conf files**

---

<p align="center">Enjoy building connections through hobbies with <b>Hobbinder</b>! 🎉</p>



