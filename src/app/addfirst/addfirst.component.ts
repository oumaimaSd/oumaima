import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
interface contenu {
  name: string;
  url: string;
  type: 'image' | 'video';
  description: string;
}

interface dom {
  id: number;
  name: string;
  media: contenu[];
  showContent: boolean;
}
@Component({
  selector: 'app-addfirst',
  templateUrl: './addfirst.component.html',
  styleUrls: ['./addfirst.component.css']
})
export class AddfirstComponent implements OnInit {
  doms: dom[] = [];

  newdomName: string = '';
  editingdomId: number | null = null;
  filtereddoms: dom[] = []; 
  domColumns: dom[][] = []; 
  domsPerPage: number = 5;
  mediaData: any[] = []; 
  currentPage: number = 1; 
  pageSize: number = 10; 
  searchDescription: string = '';
  searchType: string = '';
  searchdomName: string = '';
  showAddForm: boolean = false; 

  constructor(private authService: AuthService, private router: Router,private http: HttpClient) {} 



  ngOnInit(): void {
    const storeddoms = localStorage.getItem('doms');
    
    if (storeddoms) {
      this.doms = JSON.parse(storeddoms);
      this.filtereddoms = this.doms.slice(); 
      this.domColumns = this.chunkArray(this.filtereddoms, 5);

    }
  }
  chunkArray(array: any[], chunkSize: number): any[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }
  get pageddoms(): dom[] {
    const startIndex = (this.currentPage - 1) * this.domsPerPage;
    return this.filtereddoms.slice(startIndex, startIndex + this.domsPerPage);
  }
  get pageNumberArray(): number[] {
    const totalPages = Math.ceil(this.filtereddoms.length / this.domsPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }


  ondomPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
  }
  filterBydomName(): void {
    this.filtereddoms = this.doms.filter(dom => 
      dom.name.toLowerCase().includes(this.searchdomName.toLowerCase())
    );
  }

  savedoms(): void {
    localStorage.setItem('doms', JSON.stringify(this.doms));
  }
  showdomInput: boolean = false;

  toggleCreatedomInput(): void {
  
    this.showdomInput = !this.showdomInput;
  }


  createdom(): void {
    if (this.newdomName.trim() !== '') {
        const domNameLowercase = this.newdomName.toLowerCase(); 

        if (!this.isdomNameExists(domNameLowercase)) {
            const newdom: dom = {
                id: Date.now(),
                name: this.newdomName,
                media: [],
                showContent: false
            };
            this.doms.push(newdom);
            this.filtereddoms.push(newdom);
            this.newdomName = '';
            this.savedoms();
        } else {
            alert('Folder name already exists.');
        }
    }
    this.sortdomsAlphabetically();

}
sortdomsAlphabetically(): void {
  this.filtereddoms.sort((a, b) => a.name.localeCompare(b.name));
  localStorage.setItem('doms', JSON.stringify(this.filtereddoms));
}

  
  isdomNameExists(name: string): boolean {
    const domNames = this.doms.map(dom => dom.name.toLowerCase()); 
    return domNames.includes(name.toLowerCase()); 
  }
  
  toggledom(dom: dom): void {
    dom.showContent = !dom.showContent;
    this.savedoms();
  }
  noFileSelectedMessage: string = "No file selected";
  incorrectCodeMessage: string = "Incorrect code";

  addMedia(fileInput: HTMLInputElement, descriptionInput: HTMLInputElement, dom: dom): void {
   
      const fileList: FileList | null = fileInput.files;
      if (fileList && fileList.length > 0) {
        const file: File = fileList[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const mediaType = file.type.startsWith('image') ? 'image' : 'video';
          const newMedia: contenu = {
            name: file.name,
            url: reader.result as string,
            type: mediaType,
            description: descriptionInput.value
          };
          dom.media.push(newMedia);
          fileInput.value = ''; 
          descriptionInput.value = ''; 
          this.savedoms();
        };
        reader.readAsDataURL(file);
      } else {
        alert(this.noFileSelectedMessage);
      }
   
  }
  

  deleteMedia(dom: dom, media: contenu): void {
   
    if (confirm('Are you sure you want to delete this media ?')) {

    const index = dom.media.indexOf(media);
    if (index !== -1) {
      dom.media.splice(index, 1);
      this.savedoms();
    }
  }
}


  editdom(dom: dom): void {
  
    const newName = prompt('Enter the new folder name:', dom.name);
    if (newName && newName.trim() !== '') {
      dom.name = newName.trim();
      
      this.filtereddoms = this.doms.filter(f => 
        f.name.toLowerCase().includes(this.searchdomName.toLowerCase())
      );
  
      this.domColumns = this.chunkArray(this.filtereddoms, 5);
  
      this.savedoms();
    }
  }
 
  
  editMedia(media: contenu): void {
   
    const newDescription = prompt(`Enter the new description for${media.name} :`, media.description);
    if (newDescription !== null) {
      media.description = newDescription.trim();
      this.savedoms();
    }
  }

deletedom(dom: dom): void {
  if (confirm('Are you sure you want to delete this folder ?')) {

    const index = this.doms.findIndex(f => f.id === dom.id);
    if (index !== -1) {
      this.doms.splice(index, 1);
      this.filtereddoms = this.doms.slice(); 
      this.savedoms(); 
    }
 
}
}



  filterByDescription(dom: dom): void {
    dom.media = dom.media.filter(media => media.description.includes(this.searchDescription));
  }
  

  filterByType(dom: dom, type: 'image' | 'video'): void {
    dom.media = dom.media.filter(media => media.type === type);
  }

 
  
    toggleAddFormVisibility(): void {
    
      this.showAddForm = !this.showAddForm;}
     

    showAddMediaForm: boolean = false;

toggleAddMediaForm(): void {
 
  this.showAddMediaForm = !this.showAddMediaForm;}
 

filter(): void {
  this.filtereddoms = this.doms.filter(dom => 
    dom.name.toLowerCase().includes(this.searchdomName.toLowerCase()) &&
    dom.media.some(media =>
      media.description.toLowerCase().includes(this.searchDescription.toLowerCase()) &&
      (this.searchType === '' || media.type === this.searchType)
    )
  );
}
onPageChange(pageNumber: number): void {
  this.currentPage = pageNumber;
}

  onMediaPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
  }

  logout(): void {
    this.authService.logout();

    this.router.navigate(['/home']); 
  }




  companyName: string = "SOCIETE TUNISIENNE D'EEQUIPEMENT DE BATEAUX";
  slogan: string = "Chaque fil compte, chaque point compte. Pour des résultats impeccables, honorons chaque détail en équipe chez First Sew.";
  placeholderDescription: string = "Filtrer par description";
  placeholderdomName:string ="Filtrer par nom de dossier";
  allTypesOption: string = "Tous les types";
  nomboutton:string= "Créer";
  nomboutton2:string="filtrer";
  nomboutton3:string="Ajouter";

translateToEnglish(): void {
    this.companyName = "Tunisian Boat Equipment Company";
    this.slogan = "Every thread matters, every stitch matters. For flawless results, let's honor every detail as a team at First Sew.";
    this.placeholderDescription = "Filter by description";
    this.placeholderdomName = "Filter by folder name";
    this.allTypesOption = "All types";
    this.nomboutton="Create";
    this.nomboutton2="filter";
    this.nomboutton3="Add"

  }

 
  


  }
  
  

