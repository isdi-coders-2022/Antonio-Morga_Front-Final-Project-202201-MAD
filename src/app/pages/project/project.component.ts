import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  ifClient,
  ifProject,
  ifTask,
  UserStore,
} from 'src/app/interfaces/interfaces';
import { ProjectsService } from 'src/app/services/projects.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TasksService } from 'src/app/services/tasks.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ClientsService } from 'src/app/services/clients.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent implements OnInit {
  id!: string;
  project!: ifProject;
  userData!: UserStore;
  toDo!: ifTask[];
  doing!: ifTask[];
  toReview!: ifTask[];
  done!: ifTask[];
  projectForm!: FormGroup;
  clientForm!: FormGroup;
  newTaskForm!: FormGroup;
  alertIsError: boolean = false;
  alertIsActive: boolean = false;
  alertMessage!: string;
  client!: ifClient;
  dateActive = false;
  hasAppointment = false;
  appointment!: string;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public projects: ProjectsService,
    public store: Store<{ user: UserStore }>,
    public localStorage: LocalStorageService,
    public clients: ClientsService,
    private fb: FormBuilder
  ) {
    this.projectForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(300),
        ],
      ],
      appointment: [new Date()],
    });

    this.clientForm = fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(12),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      street: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      number: ['', [Validators.required, Validators.maxLength(5)]],
    });
  }

  handleClientUpdate() {
    if (this.clientForm.valid) {
      this.clients
        .update(
          this.localStorage.getDataFromLocalStorage() as string,
          this.client._id,
          this.clientForm.value
        )
        .subscribe({
          next: (data) => {
            this.client = data;
            this.alertIsActive = true;
            this.alertMessage = 'Cliente actualizado';
            setTimeout(() => {
              this.alertIsActive = false;
              this.alertMessage = '';
            }, 2000);
          },
          error: () => {
            this.alertIsActive = true;
            this.alertIsError = true;
            this.alertMessage =
              'Ha ocurrido un problema actualizando los datos del cliente';
            setTimeout(() => {
              this.alertIsActive = false;
              this.alertIsError = false;
              this.alertMessage = '';
            }, 2000);
          },
        });
    }
  }

  toggleDate() {
    this.dateActive = !this.dateActive;
  }

  createAppointment() {
    this.projects
      .update(
        this.localStorage.getDataFromLocalStorage() as string,
        this.project._id,
        { appointment: this.projectForm.get('appointment')?.value }
      )
      .subscribe({
        next: (data) => {
          this.project = data;
          this.alertIsActive = true;
          this.alertMessage = 'Has añadido una cita';
          setTimeout(() => {
            this.alertIsActive = false;
            this.alertMessage = '';
            this.toggleDate();
            window.location.reload();
          }, 2000);
        },
        error: () => {
          this.alertIsActive = true;
          this.alertIsError = true;
          this.alertMessage = 'Ha ocurrido un problema añadiendo la cita';
          setTimeout(() => {
            this.alertIsActive = false;
            this.alertIsError = false;
            this.alertMessage = '';
            this.toggleDate();
          }, 2000);
        },
      });
  }

  deleteAppointment() {
    this.projects
      .removeAppointment(
        this.localStorage.getDataFromLocalStorage() as string,
        this.project._id
      )
      .subscribe({
        next: (data) => {
          this.project = data;
          this.alertIsActive = true;
          this.alertIsError = false;
          this.alertMessage = 'Has eliminado la cita';
          setTimeout(() => {
            this.alertIsActive = false;
            this.alertMessage = '';
            this.toggleDate();
            window.location.reload();
          }, 2000);
        },
        error: () => {
          this.alertIsActive = true;
          this.alertIsError = true;
          this.alertMessage = 'Ha ocurrido un problema eliminando la cita';
          setTimeout(() => {
            this.alertIsActive = false;
            this.alertIsError = false;
            this.alertMessage = '';
            this.toggleDate();
          }, 2000);
        },
      });
  }

  handleDelete() {
    this.projects.remove(this.userData.token, this.project._id).subscribe({
      next: () => {
        this.alertIsActive = true;
        this.alertMessage = 'Has eliminado este proyecto';
        setTimeout(() => {
          this.alertIsActive = false;
          this.alertIsError = false;
          this.router.navigate(['dashboard']);
        }, 2000);
      },
      error: () => {
        this.alertIsActive = true;
        this.alertIsError = true;
        this.alertMessage = 'Ha ocurrido un problema eliminando tu proyecto';
        setTimeout(() => {
          this.alertIsActive = false;
          this.alertIsError = false;
        }, 2000);
      },
    });
  }

  handleSubmit() {
    this.projects
      .update(this.userData.token, this.project._id, {
        ...this.project,
        ...{ ...this.projectForm.value },
      })
      .subscribe({
        next: () => {
          this.alertIsActive = true;
          this.alertMessage = 'Has actualizado este proyecto';
          setTimeout(() => {
            this.alertIsActive = false;
            this.alertIsError = false;
            this.alertMessage = '';
          }, 2000);
        },
        error: () => {
          this.alertIsActive = true;
          this.alertIsError = true;
          this.alertMessage =
            'Ha ocurrido un problema actualizando tu proyecto';
          setTimeout(() => {
            this.alertIsActive = false;
            this.alertIsError = false;
          }, 2000);
        },
      });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') as string;
    this.store
      .select((state) => state.user)
      .subscribe({
        next: (data) => {
          this.userData = data;
        },
      });
    this.projects
      .getOne(this.localStorage.getDataFromLocalStorage() as string, this.id)
      .subscribe({
        next: (data) => {
          this.project = data;
          this.projectForm.get('title')?.setValue(this.project.title);
          this.projectForm
            .get('description')
            ?.setValue(this.project.description);

          this.toDo = this.project.toDo as ifTask[];
          this.doing = this.project.doing as ifTask[];
          this.toReview = this.project.toReview as ifTask[];
          this.done = this.project.done as ifTask[];

          if (this.project.appointment.length > 0) {
            this.appointment = new Date(
              this.project.appointment[0]
            ).toLocaleDateString();
          }

          this.project.appointment?.length !== 0
            ? (this.hasAppointment = true)
            : (this.hasAppointment = false);

          this.clients
            .getOne(
              this.localStorage.getDataFromLocalStorage() as string,
              this.project.client
            )
            .subscribe({
              next: (data) => {
                this.client = data;
                this.clientForm.get('name')?.setValue(this.client.name);
                this.clientForm.get('phone')?.setValue(this.client.phone[0]);
                this.clientForm.get('email')?.setValue(this.client.email);
                this.clientForm
                  .get('street')
                  ?.setValue(this.client.address.street);
                this.clientForm
                  .get('number')
                  ?.setValue(this.client.address.number);
              },
              error: () => {
                this.alertIsActive = true;
                this.alertIsError = true;
                this.alertMessage =
                  'Ha habido un problema cargando el proyecto';
                setTimeout(() => {
                  this.alertIsActive = false;
                  this.alertIsError = false;
                  this.alertMessage = '';
                  this.router.navigate(['dashboard']);
                }, 2000);
              },
            });
        },
        error: () => {
          this.alertIsActive = true;
          this.alertIsError = true;
          this.alertMessage = 'Ha habido un problema cargando el proyecto';
          setTimeout(() => {
            this.alertIsActive = false;
            this.alertIsError = false;
            this.alertMessage = '';
            this.router.navigate(['dashboard']);
          }, 2000);
        },
      });
  }
}
