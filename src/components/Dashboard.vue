<template>
  <div class="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-2xl font-bold mb-4">Nuclei Scanner</h1>
    <form @submit.prevent="startScan" class="mb-4 flex gap-2">
      <input v-model="url" placeholder="Enter URL to scan" required class="flex-1 px-4 py-2 border rounded-lg" />
      <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
        Start Scan
      </button>
    </form>
    
    <div v-if="loading" class="text-blue-500">Scanning...</div>

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
      </div>
    </div>

    <div v-if="error" class="text-red-500 mt-4">
      <p>Error: {{ error }}</p>
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
      loading: false,
      error: null,
    };
  },
  methods: {
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
    renderChart() {
      if (this.scanResult && this.scanResult.vulnerabilities.length) {
        const ctx = this.$refs.chartCanvas.getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: this.scanResult.vulnerabilities.map(v => v.name),
            datasets: [{
              label: 'Severity',
              data: this.scanResult.vulnerabilities.map(v => v.severity),
              backgroundColor: 'rgba(255, 0, 0, 0.6)',
            }]
          },
          options: { responsive: true }
        });
      }
    }
  }
};
</script>
