//import inquirer, mysql, and dotenv to hide user data
const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
);

function init() {
    inquirer
        .prompt([
            {
                type: 'list',
                message: 'What would you like to do?',
                choices: ["1. View All Departments", "2. View All Rows", "3. View All Employees", "4. Add A Department",
                    "5. Add A Role", "6. Add An Employee", "7. Update An Employee Role"],
                name: 'action',
            },
        ])
        .then((response) => {
            switch(response.action[0])
            {
                case "1":
                    break;
                default:
                    Console.log("Bye");
                    break;
            }
            console.log(response.action[0]);
            console.log(response);
        })
        .catch((error) => {
            if (error.isTtyError) {
                console.log("Prompt couldn't be rendered in the current environment");
            } else {
                // Something else went wrong
                console.log(error);
            };
        });
};

init();
