<!-- <template>


    
    <h2>Login</h2>
    <form name="login-form">
  
        <input type="text" id="user" placeholder="Email" required />


        <input type="password" id="password" placeholder="Password" required />
      
      
        <button type="submit">Login</button>

      
    </form>
  
</template> -->

<template>
    <div>
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <input type="text" v-model="username" placeholder="Username" required />
        <input type="password" v-model="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: '',
        password: '',
      };
    },
    methods: {
      async handleLogin() {
        try {
          const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: this.username,
              password: this.password,
            }),
          });
  
          const data = await response.json();
  
          if (response.ok) {
            // Store the token in localStorage
            localStorage.setItem('authToken', data.token);
            this.$router.push('/dash');  // Redirect to the dashboard after login
          } else {
            alert(data.msg);  // Show error message if login fails
          }
        } catch (err) {
          console.error('Error during login:', err);
        }
      },
    },
  };
  </script>
  
  
  <style>
  .error {
    color: red;
  }
  </style>
  
