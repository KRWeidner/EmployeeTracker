UPDATE employee
SET employee.role_id = 3
INNER JOIN roles ON employee.ro_id = roles.id
WHERE employee.first_name = 'Lisa' and employee.last_name = "Tomlin";