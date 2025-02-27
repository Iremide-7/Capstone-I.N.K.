
<!-- <template>
    
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
    async handleSignup() {
      try {
        const response = await this.$axios.post('/api/signup', {
          username: this.username,
          password: this.password
        });
        console.log('User signed up', response.data);
      } catch (err) {
        console.error('Error signing up', err.response.data);
      }
    }
  }
}; -->
  <!-- </script>
   -->
   <template>
    <div>
      <h2>Sign Up</h2>
      <form @submit.prevent="handleSignup">
        <div>
          <label for="username">Username</label>
          <input v-model="username" id="username" type="text" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input v-model="password" id="password" type="password" required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
      };
    },
    methods: {
      async handleSignup() {
        try {
          const response = await axios.post('http://localhost:3000/api/signup', {
            username: this.username,
            password: this.password,
          });
          console.log('Signup successful:', response.data);
          this.$router.push('/login');  // Redirect to login after successful signup
        } catch (error) {
          console.error('Error during signup:', error.response?.data || error.message);
        }
      },
    },
  };
  </script>
  
  