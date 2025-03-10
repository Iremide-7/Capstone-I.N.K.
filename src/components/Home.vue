<template>
  <div class="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-2xl font-bold mb-4">Public Comments</h1>
    <div v-if="isLoggedIn" class="mt-4">
      <h3 class="text-xl font-semibold">Add Your Comment</h3>
      <form @submit.prevent="submitComment">
        <div class="mb-4">
          <label for="vulnerabilityName" class="block text-sm font-semibold">Vulnerability Name</label>
          <input v-model="vulnerabilityName" id="vulnerabilityName" type="text" placeholder="Enter vulnerability name" required class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div class="mb-4">
          <label for="username" class="block text-sm font-semibold">Your Name</label>
          <input v-model="name" id="username" type="text" placeholder="Enter your name" required class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div class="mb-4">
          <label for="commentText" class="block text-sm font-semibold">Vulnerability Description</label>
          <input v-model="definitionText" id="commentText" type="text" placeholder="Add a comment about the vulnerability..." required class="w-full px-4 py-2 border rounded-lg"/>
        </div>

        <div class="mb-4">
          <label for="fixText" class="block text-sm font-semibold">How to Fix</label>
          <input v-model="fixText" id="fixText" type="text" placeholder="Comment on how to fix the vulnerability..." required class="w-full px-4 py-2 border rounded-lg"/>
        </div>

        <button  type="submit" class="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Submit Comment</button>
      </form>
    </div>
    <div>
    <input v-model="searchQuery" placeholder="Search vulnerabilities..." @input="searchComments">
    <ul>
      <li v-for="comment in filteredComments" :key="comment._id">
        <h3>{{ comment.vulnerabilityName }}</h3> 
        <p>{{ comment.definitionText }}</p>
        <p>How to fix: {{ comment.fixText }}</p>
      </li>
    </ul>
  </div>
    <!-- Comments Section (view-only for non-logged-in users) -->
    <div v-if="publicComments.length" class="mt-4">
      <h2 class="text-lg font-semibold">Comments:</h2>
      <ul>
        <li v-for="(comment, index) in publicComments" :key="index" class="mt-2 p-4 border rounded-lg">
          <strong>{{ comment.name }}:</strong> 
          <p><strong>Vulnerability:</strong> {{ comment.vulnerabilityName }}</p>
          <p><strong>Description:</strong> {{ comment.definitionText }}</p>
          <p><strong>Fix:</strong> {{ comment.fixText }}</p>
        </li>
      </ul>
    </div>

    <!-- No Comments Available -->
    <div v-else>
      <p class="text-gray-500">No comments available yet.</p>
    </div>

    <!-- Comment Form for logged-in users -->


    <!-- Error Message -->
    <div v-if="error" class="text-red-500 mt-4">
      <p>{{ error }}</p>
    </div>

    <!-- Loading Spinner (if fetching) -->
    <div v-if="loading" class="text-center mt-4">
      <p>Loading comments...</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      publicComments: [],
      vulnerabilityName: '',
      name: '',
      definitionText: '',
      fixText: '',
      isLoggedIn: false,  // Assume you have a login mechanism for authentication
      error: null,
      loading: false, // Flag for loading state
      searchQuery: "",
      filteredComments: [],
    };
  },
  methods: {
    async searchComments() {
      if (!this.searchQuery.trim()) {
        this.filteredComments = [];  // Clear results when empty
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3000/api/comments/search`, {
          params: { query: this.searchQuery }
        });
        this.filteredComments = response.data;
      } catch (error) {
        console.error("Error fetching search results:", error);
      }},
    // Fetch public comments (no login required)
    async fetchPublicComments() {
      this.loading = true; // Start loading
      try {
        const response = await fetch('http://localhost:3000/api/comments');
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        this.publicComments = await response.json();
      } catch (error) {
        console.error('Error fetching comments:', error);
        this.error = error.message;
      } finally {
        this.loading = false; // Stop loading
      }
    },

    // Submit a comment (requires authentication)
    async submitComment() {
      console.log('submitComment triggered');
      if (!this.vulnerabilityName.trim() || !this.name.trim() || !this.definitionText.trim() || !this.fixText.trim()) {
        this.error = 'All fields are required.';
        return;
      }

      this.loading = true; // Start loading

      try {
        const response = await fetch('http://localhost:3000/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            vulnerabilityName: this.vulnerabilityName,
            name: this.name,
            definitionText: this.definitionText,
            fixText: this.fixText,
          }),
        });

        if (response.ok) {
          const newComment = await response.json();
          alert('Comment submitted successfully!');
          this.vulnerabilityName = '';  // Reset the form fields
          this.name = '';
          this.definitionText = '';
          this.fixText = '';
          this.fetchPublicComments(); // Reload public comments
        } else {
          const data = await response.json();
          this.error = data.msg || 'Failed to submit comment.';
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
        this.error = 'Failed to submit comment.';
      } finally {
        this.loading = false; // Stop loading
      }
    },
  },

  mounted() {
    this.isLoggedIn = localStorage.getItem('authToken') ? true : false;
    this.fetchPublicComments();  // Fetch public comments when the page loads
  },
};
</script>
