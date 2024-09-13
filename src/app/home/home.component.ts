import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/service';
import { FormGroup, FormControl, FormArray, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatTableModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, CommonModule, MatIconModule, MatDividerModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  form: FormGroup;
  data: any[] = [];
  displayedColumns: string[] = ['first_name', 'last_name', 'phones', 'emails', 'addresses', 'actions'];

  constructor(private apiService: ApiService, private fb: FormBuilder) { 
    // Inicializa el FormGroup aquí
    this.form = new FormGroup({
      first_name: new FormControl(''),
      last_name: new FormControl(''),
      addresses: new FormArray([]),
      phones: new FormArray([]),
      emails: new FormArray([])
    });
  }

  ngOnInit(): void {
    this.apiService.getData().subscribe({
      next: (response) => {
        console.log("Información recibida", response.contacts.data);
        this.data = response.contacts.data;
        // if (this.data.length > 0) {
        //   this.populateForm(this.data[0]);
        // }
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
      }
    });
  }

   // Crear un grupo de dirección
   createAddress(): FormGroup {
    return this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postal_code: ['', Validators.required]
    });
  }

  // Obtener los teléfonos como FormArray
  get phones(): FormArray {
    return this.form.get('phones') as FormArray;
  }

  // Obtener los emails como FormArray
  get emails(): FormArray {
    return this.form.get('emails') as FormArray;
  }

  // Obtener las direcciones como FormArray
  get addresses(): FormArray {
    return this.form.get('addresses') as FormArray;
  }

  // Agregar un nuevo teléfono
  addPhone(): void {
    this.phones.push(this.fb.control(''));
  }

  // Agregar un nuevo email
  addEmail(): void {
    this.emails.push(this.fb.control(''));
  }

  // Agregar una nueva dirección
  addAddress(): void {
    this.addresses.push(this.createAddress());
  }

  // Enviar el formulario
  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
      this.apiService.createData(this.form.value).subscribe({
        next: (response) => {
          console.log("es la informacion que recibes", response)
        },
        error: (error) => {
          console.error('Error al obtener los datos', error);
        }
      })
    } else {
      console.log('Formulario no válido');
    }
  }

  handleAction(action: string, element: any) {
    console.log(action, element);
    // Implement your action logic here
  }
}
