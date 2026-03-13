let num1 =Number(prompt("first number:"));
let num2=Number(prompt("second number:"));
const operator =prompt("select the operator (+, -, *, /):");


if(operator === "+"){
    console.log("sum" ,  num1 + num2 ); }//performs addition
else if (operator === "-"){
    console.log("difference" ,  num1 - num2 );} //performs subtraction
else if(operator === "*"){
    console.log("product" ,  num1 * num2 );} //performs multiplication
else if (operator === "/"){
    if (num2 === 0) console.log("zero error"); //throws error when zero is input as the second number
    else console.log("quotient" ,  num1 / num2 ); //performs division
} 
else { 
    console.log("select a valid operation"); } 