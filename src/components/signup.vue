
<template>
    
      <h2>Sign Up</h2>
      <form @submit.prevent="submitForm">
    
          <input type="text" id="name" placeholder="Name" v-model="form.name" required />

          <input type="email" id="email" placeholder="Email" v-model="form.email" required />
  
          <input type="password" id="password" placeholder="Password" v-model="form.password" required />
        
        
          <button type="submit">Sign Up</button>
  
        <p v-if="message" class="success-message">{{ message }}</p>
      </form>
    
  </template>
  
  <script>
  export default {
    data() {
      return {
        form: {
          name: "",
          email: "",
          password: "",
        },
        message: "",
      };
    },
    methods: {
      submitForm() {
        if (!this.form.name || !this.form.email || !this.form.password) {
          alert("All fields are required!");
          return;
        }
  
        // Mock API request
        setTimeout(() => {
          this.message = "Signup successful!";
          console.log("User signed up:", this.form);
        }, 1000);
      },
    },
  };
  </script>
  