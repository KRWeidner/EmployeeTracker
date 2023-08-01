//import inquirer, mysql, table and dotenv to hide user data
const inquirer = require('inquirer');
const mysql = require('mysql2');
const { table } = require('table');
require('dotenv').config();

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
).promise();

//initial function to provide user list of options and redirect to the appropriate action functions
async function init() {
    const response = await inquirer
        .prompt([
            {
                type: 'list',
                message: 'What would you like to do?',
                choices: ["1. View All Departments", "2. View All Rows", "3. View All Employees", "4. Add A Department",
                    "5. Add A Role", "6. Add An Employee", "7. Update An Employee Role", "8. Delete Department", 
                    "9. Delete Role", "10. Delete Employee", "11. Quit"],
                name: 'action',
            },
        ])

    const option =response.action.split('.')[0];
    switch (option) {
        case "1":
            ViewAll("department");
            break;
        case "2":
            ViewAll("roles");
            break;
        case "3":
            ViewAll("employee");
            break;
        case "4":
            AddDepartment();
            break;
        case "5":
            AddRole();
            break;
        case "6":
            AddEmployee();
            break;
        case "7":
            UpdateEmployee();
            break;
        case "8":
            DeleteDepartment();
            break;
        case "9":
            DeleteRole();
            break;
        case "10":
            console.log("11");
            DeleteEmployee();
            break;
        case "11":
            console.log("Bye");
            process.exit(3);
        default:
            console.log("Bye");
            process.exit(3);
    }
};

//preforms select all on any table passed in and returns those results in formatted table
async function ViewAll(table_db) {
    const sql = `SELECT * FROM ${table_db}`;

    const [rows, fields] = await db.execute({ sql, rowsAsArray: true });
    const columnNames = [];
    fields.forEach(item => {
        columnNames.push(item.name);
    });
    rows.unshift(columnNames);
    console.log('\n' + table(rows));

    setTimeout(() => { init() }, 1000);
}

//function to delete a row from departments db by department name
async function DeleteDepartment() {
    const sql = `DELETE FROM department WHERE department_name = ?`;
    const departments = await getAllDepartments();

    const response = await inquirer
        .prompt([
            {
                type: 'list',
                message: 'Please select the department to delete: ',
                choices: departments,
                name: 'department',
            },
        ])

    await db.query(sql, [response.department.trim()], function (err) {
        if (err) {
            console.log(err);
        }
    });
    console.log(response.department + " deleted from database.");
    init();
}

//function to delete a row from roled db by role title
async function DeleteRole() {
    const sql = `DELETE FROM roles WHERE title = ?`;
    const roles = await getAllRoles();

    const response = await inquirer
        .prompt([
            {
                type: 'list',
                message: 'Please select the role to delete: ',
                choices: roles,
                name: 'role',
            },
        ])

    await db.query(sql, [response.role], function (err) {
        if (err) {
            console.log(err);
        }
    });
    console.log(response.role + " deleted from database.");
    init();
}

//function to delete an employee from employee db by name
async function DeleteEmployee() {
    console.log("here");
    const sql = `DELETE FROM employee WHERE first_name = ? and last_name = ?`;
    const employees = await getAllEmployees();

    const response = await inquirer
        .prompt([
            {
                type: 'list',
                message: 'Please select the employee to delete: ',
                choices: employees,
                name: 'employee',
            },
        ])

    await db.query(sql, [[response.employee.split(' ')[0]],[response.employee.split(' ')[1]]], function (err) {
        if (err) {
            console.log(err);
        }
    });
    console.log(response.employee + " deleted from database.");
    init();
}

//inserts new department to department db table
async function AddDepartment() {
    const sql = 'INSERT INTO `department` (department_name) VALUES (?)';
    const response = await inquirer
        .prompt([
            {
                type: 'input',
                message: 'Please type the name of the new department: ',
                name: 'department',
            },
        ])
    await db.query(sql, [response.department.trim()], function (err) {
        if (err) {
            console.log(err);
        }
    });
    console.log(response.department + " added to database.");
    init();
}

//inserts a new role into roles db
async function AddRole() {
    const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?)`;
    const departments = await getAllDepartments();

    const response = await inquirer
        .prompt([
            {
                type: 'input',
                message: 'Please type the name of the new role: ',
                name: 'role',
            },
            {
                type: 'input',
                message: 'Please input the role salary: ',
                name: 'salary',
            },
            {
                type: 'list',
                message: 'Which department does the role belong to?',
                choices: departments,
                name: 'department',
            },
        ])

    const departmentId = await GetDepartmentId(response.department.trim());
    await db.query(sql,
        [[response.role, response.salary, departmentId]], function (err) {
            if (err) {
                console.log(err);
            }
        });
    console.log(response.role + " added to database.");
    init();
}

//inserts a new employee into employee db
async function AddEmployee() {
    const sql = 'INSERT INTO `employee` (first_name, last_name, role_id, manager_id) VALUES (?)';
    const roles = await getAllRoles();
    const employees = await getAllEmployees();
    employees.unshift("None");

    const response = await inquirer
        .prompt([
            {
                type: 'input',
                message: 'Please type the first name of the new employee: ',
                name: 'firstName',
            },
            {
                type: 'input',
                message: 'Please type the last name of the new employee: ',
                name: 'lastName',
            },
            {
                type: 'list',
                message: 'Which is the employee\'s role?',
                choices: roles,
                name: 'role',
            },
            {
                type: 'list',
                message: 'Who is the employee\'s manager?',
                choices: employees,
                name: 'manager',
            },
        ])

    const roleId = await GetRoleId(response.role.trim());
    const managerId = response.manager !== "None" ? await GetEmployeeId(response.manager) : null;
    await db.query(sql,
        [[response.firstName, response.lastName, roleId, managerId]], function (err) {
            if (err) {
                console.log(err);
            }
        });
    console.log(response.firstName + " " + response.lastName + " added to database.");
    init();
}

//updates role of an emplyee based on name
async function UpdateEmployee() {
    const sql = `UPDATE employee SET role_id = ? WHERE employee.first_name = ? AND employee.last_name = ?`;
    const roles = await getAllRoles();
    const employees = await getAllEmployees();

    const response = await inquirer
        .prompt([
            {
                type: 'list',
                message: 'Whose employee\'s role do you wish to update?',
                choices: employees,
                name: 'employee',
            },
            {
                type: 'list',
                message: 'Which role do you wish to assign to the selected employee?',
                choices: roles,
                name: 'role',
            },
        ])

    const roleId = await GetRoleId(response.role.trim());
    await db.query(sql,
        [[roleId], [response.employee.split(' ')[0]], [response.employee.split(' ')[1]]], function (err) {
            if (err) {
                console.log(err);
            }
        });
    console.log(response.employee + " position updated.");
    init();
}

//begining of helper functions called within main methods to gather additional lookup data
//returns all department names from department db
async function getAllDepartments() {
    const sql = `SELECT department_name FROM department`;
    const [rows] = await db.execute(sql);
    return rows.map(item => item.department_name);
}

//returns the department id based on department name
async function GetDepartmentId(departmentName) {
    const sql = `SELECT id FROM department WHERE department_name = ?`;
    const [rows] = await db.execute(sql, [departmentName]);
    return rows[0].id;
}

//returns all role title from roles db
async function getAllRoles() {
    const sql = `SELECT title FROM roles`;
    const [rows] = await db.execute(sql);
    return rows.map(item => item.title);
}

//returns role id based on role title
async function GetRoleId(roleTitle) {
    const sql = `SELECT id FROM roles WHERE title = ?`;
    const [rows] = await db.execute(sql, [roleTitle]);
    return rows[0].id;
}

//returns all employees' names from employee db
async function getAllEmployees() {
    const sql = `SELECT first_name,last_name FROM employee`;
    const [rows] = await db.execute(sql);
    return rows.map(item => item.first_name + " " + item.last_name);
}

//returns employee id based on name
async function GetEmployeeId(name) {
    const sql = `SELECT id FROM employee WHERE first_name = ? AND last_name = ?`;
    const [rows] = await db.execute(sql, [name.split(' ')[0], name.split(' ')[1]]);
    return rows[0].id;
}

//call init function to begin program
init();
