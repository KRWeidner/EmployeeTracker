INSERT INTO department (department_name)
VALUES ("Accounting"),
       ("HR");

INSERT INTO role (title, salary, department_id)
VALUES ("HR Officer", 55000.80,2),
       ("Auditor", 75000.25,1),
       ("Manager", 80500.00,1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Lisa", "Tomlin", 1, null),
       ("Tom", "Gatz", 2, 3),
       ("Benny", "Holland", 3, null);
       
