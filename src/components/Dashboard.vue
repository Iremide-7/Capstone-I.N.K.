<template>
  <div class="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-2xl font-bold mb-4">Nuclei Scanner</h1>
    
    <!-- Scan form -->
    <form @submit.prevent="startScan" class="mb-4 flex gap-2">
      <input v-model="url" placeholder="Enter URL to scan" required class="flex-1 px-4 py-2 border rounded-lg" />
      <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
        Start Scan
      </button>
    </form>

    <!-- Loading status -->
    <div v-if="loading" class="text-blue-500">Scanning...</div>

    <!-- Scan results -->
    <div v-if="scanResult" class="mt-4">
      <h2 class="text-xl font-semibold">Scan Result:</h2>
      <p class="mt-2"><strong>Number of Vulnerabilities Found:</strong> {{ scanResult.numOfVulnerabilities }}</p>
      
      <div v-if="scanResult.vulnerabilities.length">
        <canvas ref="chartCanvas"></canvas>
      </div>

      <div v-for="(vuln, index) in scanResult.vulnerabilities" :key="index" class="mt-4 p-4 border rounded-lg">
        <h3 class="text-lg font-semibold">{{ vuln.name }}</h3>
        <p><strong>Protocol:</strong> {{ vuln.protocol }}</p>
        <p><strong>Severity:</strong> {{ vuln.severity }}</p>
        <p><strong>Target:</strong> {{ vuln.target }}</p>

        <!-- Comment form for logged-in users -->
        <form @submit.prevent="submitComment(vuln)">
          <textarea v-model="commentText" placeholder="Add a comment about this vulnerability..." required class="w-full px-4 py-2 border rounded-lg"></textarea>
          <button type="submit" class="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Submit Comment</button>
        </form>
      </div>
    </div>

    <!-- Public Comments Section -->
    <div v-if="publicComments.length" class="mt-4">
      <h3 class="text-lg font-semibold">Public Comments:</h3>
      <ul>
        <li v-for="(comment, index) in publicComments" :key="index" class="mt-2 p-4 border rounded-lg">
          <strong>{{ comment.username }}</strong>: {{ comment.commentText }}
        </li>
      </ul>
    </div>

    <!-- Raw Scan Data Button for logged-in users -->
    <div v-if="isLoggedIn">
      <h3 class="mt-4 text-xl font-semibold">Download Raw Scan Data</h3>
      <button @click="downloadRawData" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Download</button>
    </div>

    <!-- Error message -->
    <div v-if="error" class="text-red-500 mt-4">
      <p>Error: {{ error }}</p>
    </div>
    <!-- Log Out Button for logged-in users -->
<div v-if="isLoggedIn" class="mt-4">
  <button @click="logout" class="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Log Out</button>
</div>

  </div>
  
</template>

<script>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';

export default {
  data() {
    return {
      url: '',
      scanResult: null,
      commentText: '',
      loading: false,
      error: null,
      publicComments: [],
      isLoggedIn: false,  // Assume you have a login mechanism and state for it
    };
  },
  methods: {
    // Logout method
  logout() {
    // Clear the stored authentication token and username
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    
    // Set the isLoggedIn flag to false
    this.isLoggedIn = false;

    // Optionally, redirect to login or home page
    window.location.href = '/login'; // Or use Vue Router to navigate to login page
  },
  
    // Start scanning
    async startScan() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('http://localhost:3000/start-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUrl: this.url }),
        });

        if (!response.ok) {
          throw new Error('Failed to start the scan');
        }

        this.scanResult = await response.json();
        this.renderChart();
      } catch (error) {
        console.error(error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    // Render the vulnerability chart
    renderChart() {
      if (this.scanResult && this.scanResult.vulnerabilities.length) {
        const ctx = this.$refs.chartCanvas.getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: this.scanResult.vulnerabilities.map(v => v.name),
            datasets: [{
              label: 'Severity',
              data: this.scanResult.vulnerabilities.map(v => this.severityToNumeric(v.severity)),
              backgroundColor: 'rgba(255, 0, 0, 0.6)',
            }]
          },
          options: { responsive: true }
        });
      }
    },

    // Convert severity to numeric value for charting
    severityToNumeric(severity) {
      switch (severity.toLowerCase()) {
        case 'critical': return 3;
        case 'high': return 2;
        case 'medium': return 1;
        case 'low': return 0;
        default: return 0;
      }
    },

    // Submit a comment about a vulnerability
    async submitComment(vuln) {
  if (!this.commentText.trim()) {
    alert('Please enter a comment.');
    return;
  }

  const username = localStorage.getItem('username');  // Assuming the username is saved in localStorage after login
  if (!username) {
    alert('You must be logged in to submit a comment.');
    return;
  }
  

  try {
    const response = await fetch('http://localhost:3000/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        username: username, // Include username
        commentText: this.commentText,
      }),
    });

    if (response.ok) {
      const newComment = await response.json();
      alert('Comment submitted successfully!');
      this.commentText = '';  // Reset the textarea
      this.fetchPublicComments(); // Reload public comments
    } else {
      const data = await response.json();
      alert(data.msg);
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert('Failed to submit comment.');
  }
},


    // Download raw scan data
    async downloadRawData() {
    try {
      const response = await fetch('http://localhost:3000/download-scan-results');
      
      if (!response.ok) {
        throw new Error('Failed to download the scan results');
      }

      // Create a temporary link to trigger the download
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'scan-results.txt';  // The name of the file being downloaded
      link.click();
    } catch (error) {
      console.error('Error downloading raw data:', error);
      alert('Failed to download rawdata');
    }
  },
    // Fetch public comments (no login required)
    async fetchPublicComments() {
      try {
        const response = await fetch('http://localhost:3000/api/comments');
        this.publicComments = await response.json();
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }
  },

  mounted() {
    this.isLoggedIn = localStorage.getItem('authToken') ? true : false;
    this.fetchPublicComments();  // Fetch public comments when the page loads
    if (!this.isLoggedIn) {
    // Redirect to login page if not logged in
    window.location.href = '/login'; // Update this with your login route if using Vue Router
  } else {
    this.fetchPublicComments();  // Fetch public comments when logged in
  }
  }
};

</script>
