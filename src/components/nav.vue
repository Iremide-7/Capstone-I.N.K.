<script>

</script>
<template>
    <nav class="nav-container">
      <div class="logo">Interactive Nexus of Knowledge</div>
      <div class="nav-links">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/dash">Dashboard</RouterLink>
    <RouterLink to="/login">Login</RouterLink> 
    <RouterLink to="/signup">SignUp</RouterLink> 
  </div>
  </nav>
    
</template>
<style scoped>
.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: #004d00; /* Dark Green */
  padding: 15px 20px;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.nav-links a {
  color: white;
  text-decoration: none;
  margin: 0 15px;
  font-weight: bold;
}

.nav-links a:hover {
  text-decoration: underline;
}
</style>