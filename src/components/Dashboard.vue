
 <template>
  <div class="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-2xl font-bold mb-4">Scanner</h1>
    
    <form @submit.prevent="startURLScan" class="mb-4 flex gap-2">
      <input v-model="url" placeholder="Enter URL to scan" required class="flex-1 px-4 py-2 border rounded-lg" />
      <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
        Start URL Scan
      </button>
    </form>
    
    <form @submit.prevent="startIPScan" class="mb-4 flex gap-2">
      <input v-model="ip" placeholder="Enter IP to scan" required class="flex-1 px-4 py-2 border rounded-lg" />
      <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
        Start IP Scan 
      </button>
    </form>
    
    <div v-if="loading" class="text-blue-500">Scanning...</div>
    
    <div v-if="scanReport" class="mt-4">
      <h2 class="text-xl font-semibold">Scan Result:</h2>
      <p class="mt-2"><strong>Number of Vulnerabilities Found:</strong> {{ scanReport.numOfVulnerabilities }}</p>
      
      <div v-for="(vuln, index) in scanReport.vulnerabilities" :key="index" class="mt-4 p-4 border rounded-lg">
        <h3 class="text-lg font-semibold">{{ vuln.name }}</h3>
        <p><strong>Protocol:</strong> {{ vuln.protocol }}</p>
        <p><strong>Target:</strong> {{ vuln.target }}</p>
      </div>
    </div>

    <!-- Download Scan Data Button for logged-in users -->
    <div v-if="isLoggedIn">
      <h3 class="mt-4 text-xl font-semibold">Download Scan Data</h3>
      <button @click="downloadData" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Download</button>
    </div>

    <div v-if="error" class="text-red-500 mt-4">
      <p>Error: {{ error }}</p>
    </div>
    
  
  <div class="w-full flex justify-end p-4">
    <button v-if="isLoggedIn" @click="logout" class="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
      Log Out
    </button>
  </div>
  </div>
 

</template>


<script>
import { ref, onMounted } from 'vue';

export default {
  data() {
    return {
      url: '',
      ip: '',
      scanReport: null,
      loading: false,
      error: null,
      isLoggedIn: false,
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      this.isLoggedIn = false;
      window.location.href = '/login';
    },
    async startURLScan() {
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

        
    const data = await response.json(); // Parse response before accessing properties

   if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
        alert("No Vulnerability found");
       }
        this.scanReport = data
        localStorage.setItem('scanReport', JSON.stringify(this.scanReport));
      } catch (error) {
        console.error(error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async startIPScan() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('http://localhost:3000/start-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetIP: this.ip }),
        });
        if (!response.ok) {
          throw new Error('Failed to start the scan');
        }
        const data = await response.json();

    if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
      alert("No Vulnerability found");
    }

        this.scanReport = await data
        localStorage.setItem('scanReport', JSON.stringify(this.scanReport));
      } catch (error) {
        console.error(error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async downloadData() {
      try {
        const response = await fetch('http://localhost:3000/download-scan-results');
        if (!response.ok) {
          throw new Error('Failed to download the scan results');
        }
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Vulnerbility-Report.txt';
        link.click();
      } catch (error) {
        console.error('Error downloading raw data:', error);
        alert('Failed to download raw data');
      }
    }
  },
  mounted() {
      // Check if scanReport is in localStorage and load it
      const savedScanReport = localStorage.getItem('scanReport');
    if (savedScanReport) {
      this.scanReport = JSON.parse(savedScanReport);
    }
    this.isLoggedIn = localStorage.getItem('authToken') ? true : false;
    if (!this.isLoggedIn) {
      window.location.href = '/login';
    }
  }
};
</script>
