<template>
  <div class="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-2xl font-bold mb-4">Public Comments</h1>

    <!-- Comments Section -->
    <div v-if="publicComments.length" class="mt-4">
      <h2 class="text-lg font-semibold">Comments:</h2>
      <ul>
        <li v-for="(comment, index) in publicComments" :key="index" class="mt-2 p-4 border rounded-lg">
          <strong>{{ comment.username }}:</strong> {{ comment.commentText }}
        </li>
      </ul>
    </div>

    <!-- No Comments Available -->
    <div v-else>
      <p class="text-gray-500">No comments available yet.</p>
    </div>

    <!-- Comment Form for logged-in users -->
    <div v-if="isLoggedIn" class="mt-4">
      <h3 class="text-xl font-semibold">Add Your Comment</h3>
      <form @submit.prevent="submitComment">
        <textarea v-model="commentText" placeholder="Add a comment..." required class="w-full px-4 py-2 border rounded-lg"></textarea>
        <button type="submit" class="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Submit Comment</button>
      </form>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-red-500 mt-4">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  data() {
    return {
      publicComments: [],
      commentText: '',
      isLoggedIn: false,  // Assume you have a login mechanism for authentication
      error: null,
    };
  },
  methods: {
    // Fetch public comments (no login required)
    async fetchPublicComments() {
      try {
        const response = await fetch('http://localhost:3000/api/comments');
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        this.publicComments = await response.json();
      } catch (error) {
        console.error('Error fetching comments:', error);
        this.error = error.message;
      }
    },

    // Submit a comment (requires authentication)
    async submitComment() {
      if (!this.commentText.trim()) {
        alert('Please enter a comment.');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ commentText: this.commentText }),
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
  },

  mounted() {
    this.isLoggedIn = localStorage.getItem('authToken') ? true : false;
    this.fetchPublicComments();  // Fetch public comments when the page loads
  },
};
</script>
