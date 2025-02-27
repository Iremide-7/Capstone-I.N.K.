<template>
  <div>
    <h2>Home</h2>
    <div v-if="isLoggedIn">
      <h3>Vulnerability Comments</h3>
      <form @submit.prevent="submitComment">
        <textarea v-model="commentText" placeholder="Add a comment about the vulnerability..." required></textarea>
        <button type="submit">Submit Comment</button>
      </form>

      <div v-if="comments.length">
        <h4>Previous Comments</h4>
        <ul>
          <li v-for="(comment, index) in comments" :key="index">{{ comment }}</li>
        </ul>
      </div>

      <h3>Download Raw Scan Data</h3>
      <button @click="downloadScanData">Download Scan Data</button>
    </div>

    <div v-else>
      <p>Please log in to view the home page.</p>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isLoggedIn: false, // Set based on the authentication status
      commentText: "",
      comments: [],
    };
  },
  methods: {
    submitComment() {
      if (this.commentText.trim()) {
        // Mock submitting the comment
        this.comments.push(this.commentText);
        this.commentText = ""; // Clear the textarea
        console.log("Comment added:", this.commentText);
      } else {
        alert("Please enter a valid comment.");
      }
    },
    downloadScanData() {
      // Here, you would call your API to get the raw scan data and download it
      // For now, we simulate a file download
      const data = "Raw scan data would be here."; // Replace with actual scan data
      const blob = new Blob([data], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "scan_data.txt"; // Filename for download
      link.click();
    },
  },
  mounted() {
    // Check if user is logged in (this could be through a token in localStorage or session)
    this.isLoggedIn = true; // Mock logged-in state
  },
};
</script>
