import { useState } from "react";
import "./App.css";

function App() {
const [name, setName]=useState("");
const [email, setEmail]=useState("");
const [password, setPassword]=useState("");

const handleSubmit = (e) => {
  e.preventDefault();

if (!name || !email || !password) {
      alert("fill in all the fields");
      return;
    }

if(/[0-9]/.test(name)){
  alert("Name should not contain numbers.");
  return;
}

if(!email.includes("@")){
  alert("Please enter a valid email address.");
  return;
}

if(password.length < 6){
  alert("Password must be at least 6 characters long.");
  return;
}

alert("Form submitted successfully!");


  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Password:", password);
};



  return (
    <div className="container">
      <h1>Interactive React Form</h1>
<form onSubmit={handleSubmit}>

<p>Your name is: </p>
      <input type="text" placeholder="Enter your name" 
      value={name}
      onChange={(e) => setName(e.target.value)}/>
      <br/>  <br/>

<p>Your email is: </p>
      <input type="email" placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}/>
      <br/>  <br/>

<p>Your password is: </p>
      <input type="password" placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}/>
      <br/>  <br/>

      <button type="submit">Submit</button>
      </form>
    </div>

  );
}

export default App;