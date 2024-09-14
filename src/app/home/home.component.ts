import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/service';
import { FormGroup, FormControl, FormArray, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatTableModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, CommonModule, MatIconModule, MatDividerModule, MatPaginatorModule, MatDialogModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  form: FormGroup;
  data: any[] = [];
  editingId: number | null = null;
  totalContacts = 0;  // Total de contactos para paginación
  currentPage = 1;    // Página actual
  pageSize = 50;      // Tamaño de página
  showForm = false;
  displayedColumns: string[] = ['first_name', 'last_name', 'phones', 'emails', 'addresses', 'actions'];
  flatedit = false;
  isLoading = false;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      id: new FormControl(),
      first_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required),
      addresses: new FormArray([]),
      phones: new FormArray([]),
      emails: new FormArray([])
    });
  }
  buscar(event: any) {
    this.isLoading = true
    this.apiService.getDatafilter(1, event.target.value).subscribe({
      next: (response) => {
        this.isLoading = false
        this.data = response.contacts.data;
        this.totalContacts = response.contacts.total;
        console.log(response);

      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
      }
    });


  }
  ngOnInit(): void {
    this.apiService.getData().subscribe({
      next: (response) => {
        this.data = response.contacts.data;
        this.totalContacts = response.contacts.total;
        console.log(response);

      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
      }
    });
  }
  loadContacts(page: number = 1): void {
    this.isLoading = true

    this.apiService.getData(page).subscribe((response: any) => {
      console.log(response);
      this.isLoading = false
      this.data = response.contacts.data;
      this.totalContacts = response.contacts.total;
    });
  }

  // Manejador de cambio de página
  onPageChange(event: PageEvent): void {
    this.loadContacts(event.pageIndex + 1);  // Cargar la página seleccionada
  }

  // Mostrar u ocultar formulario
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.form.reset();
      this.flatedit = false;
    }
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
    this.phones.push(this.fb.control('', Validators.required));
  }

  // Agregar un nuevo email
  addEmail(): void {
    this.emails.push(this.fb.control('', [Validators.required, Validators.email]));
  }

  // Agregar una nueva dirección
  addAddress(): void {
    this.addresses.push(this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postal_code: ['', Validators.required]
    }));
  }


  // Eliminar un teléfono por su índice
  removePhone(): void {
    const phonesArray = this.phones;
    if (phonesArray.length > 0) {
      phonesArray.removeAt(phonesArray.length - 1);
    }
  }

  // Eliminar un email por su índice
  removeEmail(): void {
    const emailsArray = this.emails;
    if (emailsArray.length > 0) {
      emailsArray.removeAt(emailsArray.length - 1);
    }
  }

  // Eliminar una dirección por su índice
  removeAddress(): void {
    const addressesArray = this.addresses;
    if (addressesArray.length > 0) {
      addressesArray.removeAt(addressesArray.length - 1);
    }
  }

  // Limpiar y setear los datos de un FormArray
  setFormArray(controlName: string, values: any[]) {
    const formArray = this.form.get(controlName) as FormArray;
    formArray.clear();  // Limpia el array existente

    values.forEach(value => {
      if (controlName === 'addresses') {
        formArray.push(this.fb.group({
          street: value.street,
          city: value.city,
          state: value.state,
          postal_code: value.postal_code
        }));
      } else {
        formArray.push(new FormControl(value));  // Para phones y emails, solo agregamos los valores simples
      }
    });
  }

  // Manejo de acciones (editar)
  handleAction(element: any) {

    this.flatedit = true;
    this.showForm = true;
    this.editingId = element.id;

    this.form.patchValue({
      first_name: element.first_name,
      last_name: element.last_name
    });

    // Llenar arrays de phones, emails y addresses
    this.setFormArray('phones', element.phones.map((phone: any) => phone.phone_number));
    this.setFormArray('emails', element.emails.map((email: any) => email.email_address));
    this.setFormArray('addresses', element.addresses.map((address: any) => ({
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code
    })));

  }

  // Enviar los datos editados
  update(): void {
    this.isLoading = true

    if (this.form.valid) {
      const updatedData = { ...this.form.value, id: this.editingId };
      console.log(this.form.value);
      this.apiService.editData(updatedData).subscribe({
        next: (response) => {
          console.log("Datos actualizados con éxito", response);
          // Aquí puedes actualizar la tabla o resetear el formulario
          // Actualiza la tabla visualmente

          this.data = this.data.map(item => item.id === this.editingId ? updatedData : item);

          console.log("data recibida", this.data);


          // Resetear el formulario y los flags de edición
          this.flatedit = false;
          this.showForm = false;
          this.editingId = null;
          this.form.reset();
          this.isLoading = false
          Swal.fire({
            title: '¡Éxito!',
            text: 'El contacto ha editado  exitosamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        },
        error: (error) => {
          console.error('Error al actualizar los datos', error);
        }
      });
    } else {
      console.log('Formulario no válido');
    }
  }

  // Enviar el formulario para crear
  onSubmit(): void {
    this.isLoading = true

    if (this.form.valid) {
      this.apiService.createData(this.form.value).subscribe({
        next: (response) => {
          console.log("Datos creados con éxito", response);
          this.data.unshift(response);
          this.showForm = false;
          this.form.reset();
          this.isLoading = false
          Swal.fire({
            title: '¡Éxito!',
            text: 'El contacto ha sido creado exitosamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        },
        error: (error) => {
          console.error('Error al crear los datos', error);
        }
      });
    } else {
      console.log('Formulario no válido');
    }
  }

  delete(element: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás recuperar este elemento!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(element);
        this.apiService.deleteData(element).subscribe({
          next: (response) => {
            // console.log("Datos actualizados con éxito", response);
            
            // Aquí puedes actualizar la tabla o resetear el formulario
            this.flatedit = false;
            this.editingId = null;
            this.form.reset();

            this.data = this.data;
          },
          error: (error) => {
            console.error('Error al actualizar los datos', error);
          }
        });
      }
    });


  }

}
