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
                    "5. Add A Role", "6. Add An Employee", "7. Update An Employee Role"],
                name: 'action',
            },
        ])

    switch (response.action[0]) {
        case "1":
            ViewAll("department");
            break;
        case "2":
            ViewAll("role");
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
            break;
        case "7":
            break;
        default:
            Console.log("Bye");
            break;
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

//inserts new department to department db table
async function AddDepartment() {
    const response = await inquirer
        .prompt([
            {
                type: 'input',
                message: 'Please type the name of the new department: ',
                name: 'department',
            },
        ])
    db.execute('INSERT INTO `department` (department_name) VALUES (?)', [response.department.trim()], function (err) {
        if (err) {
            console.log(err);
        }
        console.log(response.department + " added to database.");
    });
    setTimeout(() => { init() }, 1000);
}

async function AddRole() {
    const sql = 'INSERT INTO `role` (title, salary, department_id) VALUES (?)';
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
    console.log([response.role, parseFloat(response.salary).toFixed(2), departmentId]);
    await db.execute('INSERT INTO `role` (title, salary, department_id) VALUES (?)',
        [response.role, response.salary, departmentId], function (err) {
            if (err) {
                console.log(err);
            }
            console.log(response.role + " added to database.");
        });

    //setTimeout(() => { init() }, 1000);
}

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
    // console.log([response.role, parseFloat(response.salary).toFixed(2), departmentId]);
    await db.execute(sql,
        ["Luis", "Mendoza",3,2], function (err) {
            if (err) {
                console.log(err);
            }
            console.log(response.role + " added to database.");
        });

    //setTimeout(() => { init() }, 1000);
}

async function getAllDepartments() {
    const sql = `SELECT department_name FROM department`;
    const [rows] = await db.execute(sql);
    return rows.map(item => item.department_name);
}

async function GetDepartmentId(departmentName) {
    const sql = `SELECT id FROM department WHERE department_name = ?`;
    const [rows] = await db.execute(sql, [departmentName]);
    return rows[0].id;
}

async function getAllRoles() {
    const sql = `SELECT title FROM role`;
    const [rows] = await db.execute(sql);
    return rows.map(item => item.title);
}

async function GetRoleId(roleTitle) {
    const sql = `SELECT id FROM role WHERE title = ?`;
    const [rows] = await db.execute(sql, [roleTitle]);
    return rows[0].id;
}

async function getAllEmployees() {
    const sql = `SELECT first_name,last_name FROM employee`;
    const [rows] = await db.execute(sql);
    return rows.map(item => item.first_name + " " + item.last_name);
}

async function GetEmployeeId(name) {
    console.log(name.split(' ')[0]);
    console.log(name.split(' ')[1]);
    const sql = `SELECT id FROM employee WHERE first_name = ? AND last_name = ?`;
    const [rows] = await db.execute(sql, [name.split(' ')[0], name.split(' ')[1]]);
    return rows[0].id;
}

//init();
AddEmployee();
