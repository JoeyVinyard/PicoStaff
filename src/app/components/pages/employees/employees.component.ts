import { Component, ViewChild, OnDestroy, Input, OnInit } from '@angular/core';
import {  Employee } from 'src/app/models/employee';
import { MatTableDataSource, MatDialog, MatSnackBar, MatPaginator } from '@angular/material';
import { LocationService } from 'src/app/services/location.service';
import { NewEmployeeDialogComponent } from './new-employee-dialog/new-employee-dialog.component';
import { Location } from 'src/app/models/location';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { DeleteEmployeeConfirmationComponent } from './delete-employee-confirmation/delete-employee-confirmation.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnDestroy, OnInit {

  @Input() inline: boolean = false;

  subscriptions: Subscription[] = [];
  dataSource = new MatTableDataSource<[string, Employee]>();
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'action'];
  loadedLocation: Location;
  locations: [string, Location][];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  public openNewEmployeeDialog(employee?: [string, Employee]): void {
    const dialogRef = this.dialog.open(NewEmployeeDialogComponent, {
      width: '300px',
      data: employee ? {employee: employee[1]} : {}
    });
    dialogRef.afterClosed().subscribe((newEmployee: Employee) => {
      if(newEmployee) {
        if(employee) {
          console.log(employee)
          this.loadedLocation.updateEmployee(employee[0], newEmployee)
          .then(() => this.snackbar.open("Employee succesfully updated.", "Dismiss", {duration: 3000}))
          .catch(() => this.snackbar.open("Failed to update Employee. Please try again later.", "Dismiss", {duration: 3000}));
        } else {
          this.loadedLocation.addEmployee(newEmployee)
          .then(() => this.snackbar.open("Employee succesfully added.", "Dismiss", {duration: 3000}))
          .catch(() => this.snackbar.open("Failed to add Employee. Please try again later.", "Dismiss", {duration: 3000}));
        }
      }
    });
  }

  public delete(employee: [string, Employee]): void {
    const dialogRef = this.dialog.open(DeleteEmployeeConfirmationComponent, {
      width: '300px',
      data: employee[1]
    });
    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if(confirm) {
        this.loadedLocation.deleteEmployee(employee[0])
        .then(() => this.snackbar.open("Employee succesfully deleted.", "Dismiss", {duration: 5000}))
        .catch(() => this.snackbar.open("Error deleting employee, please try again later.", "Dismiss", {duration: 5000}))
      }
    });
  }

  private parseEmployees(employees: Map<string, Employee>): void {
    this.dataSource.data = Array.from(employees.entries());
    this.snackbar.dismiss();
  }

  public filter(f: string): void {
    this.dataSource.filter = f.trim().toLowerCase();
  }

  public buttonContent(): string {
    return `New ${window.innerWidth > 800 && !this.inline ? "Employee" : ""}`;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private locationService: LocationService, private userService: UserService, public dialog: MatDialog, public snackbar: MatSnackBar) {
    this.snackbar.open("Loading Employees...", "Dismiss");
    this.locationService.getCurrentLocation().subscribe((location) => {
      if(location) {
        this.loadedLocation = location;
        this.subscriptions.push(this.loadedLocation.getEmployees().subscribe(this.parseEmployees.bind(this)));
      }
    });
  }
}
