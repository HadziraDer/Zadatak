import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Template } from './model/template';
import { Formular } from './model/formular';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public adminTemplate: Template;
  public formularTemplate: Template;
  public activeTab: number;
  public activeTemplate: { name: '' };
  public tempFormular: Formular;
  public activeFormular: Formular;
  myForm: FormGroup;
  formularForm: FormGroup;
  public tempArray: [];


  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      fields: this.fb.array([])
    })
    this.formularForm = this.fb.group({
      name: '',
      version: '',
      fields: this.fb.array([])
    })
    this.activeTab = 1;
  }

  addNewField() {
    let control = <FormArray>this.myForm.controls.fields;
    control.push(
      this.fb.group({
        label: ['', Validators.required],
        type: ['', Validators.required],
        validations: ['', Validators.required],
        radioValues: this.fb.array([])
      })
    )
  }
  addNewRadioValue(control) {
    control.push(
      this.fb.group({
        value: ['']
      }))
  }
  deleteField(index) {
    let control = <FormArray>this.myForm.controls.fields;
    control.removeAt(index)
  }
  deleteValue(control, index) {
    control.removeAt(index)
  }

  checkType(value, control) {
    //Add radio values
    if (value == "radio") {
      control.push(
        this.fb.group({
          value: ['']
        }))
    }
    //Delete existing radio values if user change value
    if (value == 'checkbox' || value == 'textbox') {
      let arr = <FormArray>control;     
      while (arr.length !== 0) {
        arr.removeAt(0)
      }
    }
  }
  search(value) {
    //Remove last searched template
    let fArray = <FormArray>this.myForm.controls['fields'];    
    while (fArray.length !== 0) {
      fArray.removeAt(0)
    }

    let allTemplates = JSON.parse(localStorage.getItem('all_templates'));
    let newTemplate = new Template();
    newTemplate = allTemplates.find(template => template.name === value);

    if (newTemplate) {
      // Existing template
      this.activeTemplate = allTemplates.find(template => template.name === value);
      this.myForm.setValue({ name: newTemplate.name, fields: ([this.setFieldsForTemplate(newTemplate)]) });
    }
    else {
      // Non existing template
      let control = this.myForm.controls.name;
      control.setValue(value);
      this.addNewField();
    }
  }

  setFieldsForTemplate(template) {
    let control = <FormArray>this.myForm.controls.fields;
    let fields = template.fields;
    fields.forEach(x => {
      control.push(this.fb.group({
        label: x.label,
        type: x.type,
        validations: x.validations,
        radioValues: this.setRadioValues(x)
      }))
    })
  }
  setRadioValues(x) {
    let arr = new FormArray([])
    x.radioValues.forEach(y => {
      arr.push(this.fb.group({
        value: y.value
      }))
    })
    return arr;
  }

  onSubmit() {
    if (this.myForm.valid) {
      this.adminTemplate = new Template();
      this.adminTemplate = this.myForm.value;


      // Get all templates
      let allTemplates = JSON.parse(localStorage.getItem('all_templates'));
      if (allTemplates === null) {
        // If there is no any template, create empty array
        allTemplates = []
      }

      let existingTemplate = allTemplates.find(template => template.name === this.adminTemplate.name);
      if (existingTemplate) {
        // Edit existing template
        let existingTemplateID = allTemplates.findIndex(template => template.name === this.adminTemplate.name);
        allTemplates[existingTemplateID] = this.adminTemplate
        localStorage.setItem('all_templates', JSON.stringify(allTemplates));
        alert("Template updated successfully");
      }
      else {
        let tempName = this.adminTemplate.name;
        let existingName = allTemplates.find(template => template.name == tempName);
        if (existingName) {
          alert("Template name already exist");
        }
        else {
          // Add a new template to array
          allTemplates.push(this.adminTemplate)
          localStorage.setItem('all_templates', JSON.stringify(allTemplates));
          alert("Template added successfully");
        }
      }
    }
    else {
      alert("Error");
      this.myForm.reset();
      let fArray = <FormArray>this.myForm.controls['fields'];
      while (fArray.length !== 0) {
        fArray.removeAt(0)
      }
    }
    this.myForm.reset();
    let fArray = <FormArray>this.myForm.controls['fields'];
    while (fArray.length !== 0) {
      fArray.removeAt(0)
    }
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    if (tab === 2) {
      this.renderFormular()
    }
  }


  setFieldsForFormular(template) {
    let control = <FormArray>this.formularForm.controls.fields;
    let fields = template.fields;
    fields.forEach(x => {
      control.push(this.fb.group({
        value: '',
        label: x.label,
        type: x.type,
        validations: x.validations,
        radioValues: this.setRadioValues(x)
      }))
    })
  }
  loadFieldsForFormular(formular) {
    let fArray = <FormArray>this.formularForm.controls['fields'];
    while (fArray.length !== 0) {
      fArray.removeAt(0)
    }
    let control = <FormArray>this.formularForm.controls.fields;
    let fields = formular.fields;
    fields.forEach(x => {
      control.push(this.fb.group({
        value: x.value,
        label: x.label,
        type: x.type,
        validations: x.validations,
        radioValues: this.setRadioValues(x)
      }))
    })
  }

  renderFormular(formularName?: string, formularVersion?: number) {
    //Get all templates.
    let allTemplates = JSON.parse(localStorage.getItem('all_templates'));
    let allFormulars = JSON.parse(localStorage.getItem("all_formulars"));
    this.tempArray = allTemplates.map(function (template) { return template.name })

    //Render formular for edit.
    if (formularName != null && formularVersion != null) {
      let newFormular = new Formular();
      newFormular = allFormulars.find(x => x.name === formularName.trim() && x.version === formularVersion);     
      if (newFormular != null) {
        this.formularForm.setValue({
          name: newFormular.name,
          version: newFormular.version,
          fields: ([this.loadFieldsForFormular(newFormular)])
        });
      }
    }
    else {
      //Render new Formular         
      this.formularForm.setValue({ name: '', version: '', fields: ([]) });
    }

  }

  isNumbericValue(n) {
    return isNaN(parseFloat(n))
  }

  submitFormular() {
    if (this.formularForm.valid) {
      this.tempFormular = new Formular();
      this.tempFormular = this.formularForm.value;

      // Get all templates
      let allFormulars = JSON.parse(localStorage.getItem('all_formulars'));
      if (allFormulars === null) {
        // If there is no any template, create empty array
        allFormulars = []
      }
      let existingFormular = allFormulars.find(x => x.name === this.tempFormular.name.trim() && x.version === this.tempFormular.version);
      if (existingFormular) {
        // Edit existing template

        let existingFormularID = allFormulars.findIndex(x => x.name === this.tempFormular.name.trim() && x.version === this.tempFormular.version);
        allFormulars[existingFormularID] = this.tempFormular;
        localStorage.setItem('all_formulars', JSON.stringify(allFormulars));
        alert("Formular updated successfully");
      }
      else {
        // Add a new template to array 
        allFormulars.push(this.tempFormular)
        localStorage.setItem('all_formulars', JSON.stringify(allFormulars));
        alert("Formular added successfully");
      }
      this.formularForm.reset();
      let fArray = <FormArray>this.formularForm.controls['fields'];
      while (fArray.length !== 0) {
        fArray.removeAt(0)
      }
    }
  }
  changeTemplate(template) {
    this.formularForm.reset();
    let fArray = <FormArray>this.formularForm.controls['fields'];
    while (fArray.length !== 0) {
      fArray.removeAt(0)
    }
    let allTemplates = JSON.parse(localStorage.getItem('all_templates'));
    let newTemplate = allTemplates.find(x => x.name == template);
    this.formularForm.setValue({
      name: newTemplate.name,
      version: '',
      fields: ([this.setFieldsForFormular(newTemplate)])
    })
  }

}
