import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
interface contenu {
  name: string;
  url: string;
  type: 'image' | 'video';
  description: string;
}

interface doc {
  id: number;
  name: string;
  media: contenu[];
  showContent: boolean;
}

@Component({
  selector: 'app-addspi',
  templateUrl: './addspi.component.html',
  styleUrls: ['./addspi.component.css']
})
export class AddspiComponent implements OnInit {

   compteur: number = 0; // Variable de compteur
   isAdmin: boolean = false;
   afficherFormulaire = false;
   modifierIndex: number | null = null; // Index du membre à modifier
 
   groupesDeProduits: any[] = [];


 
   estConnecte(): boolean {
     return this.authService.estConnecte();
   }
   docs: doc[] = [];

   newdocName: string = '';
   editingdocId: number | null = null;
   filtereddocs: doc[] = []; 
   docColumns: doc[][] = []; 
   docsPerPage: number = 5;
   mediaData: any[] = []; 
   currentPage: number = 1; 
   pageSize: number = 10; 
   searchDescription: string = '';
   searchType: string = '';
   searchdocName: string = '';
   showAddForm: boolean = false; 
 
   constructor(private renderer: Renderer2, private elementRef: ElementRef ,private authService: AuthService, private router: Router,private http: HttpClient) {} 
   largeImageUrl: string = '';
   showLargeImage: boolean = false;
   
 
   closeImage(): void {
     this.showLargeImage = false;
   }
   toggleFullScreen(event: MouseEvent) {
    const img = event.target as HTMLImageElement;
    if (!document.fullscreenElement) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'zoom-out');
      if (this.elementRef.nativeElement.requestFullscreen) {
        this.elementRef.nativeElement.requestFullscreen();
      }
    } else {
      this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'zoom-in');
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
 
   ngOnInit(): void {
     const storeddocs = localStorage.getItem('docs');
     
     if (storeddocs) {
       this.docs = JSON.parse(storeddocs);
       this.filtereddocs = this.docs.slice(); 
       this.docColumns = this.chunkArray(this.filtereddocs, 5);
 
     }
   }
   chunkArray(array: any[], chunkSize: number): any[][] {
     const result = [];
     for (let i = 0; i < array.length; i += chunkSize) {
       result.push(array.slice(i, i + chunkSize));
     }
     return result;
   }
   get pageddocs(): doc[] {
     const startIndex = (this.currentPage - 1) * this.docsPerPage;
     return this.filtereddocs.slice(startIndex, startIndex + this.docsPerPage);
   }
   get pageNumberArray(): number[] {
     const totalPages = Math.ceil(this.filtereddocs.length / this.docsPerPage);
     return Array.from({ length: totalPages }, (_, index) => index + 1);
   }
 
 
   ondocPageChange(pageNumber: number): void {
     this.currentPage = pageNumber;
   }
   filterBydocName(): void {
     this.filtereddocs = this.docs.filter(doc => 
       doc.name.toLowerCase().includes(this.searchdocName.toLowerCase())
     );
   }
 
   savedocs(): void {
     localStorage.setItem('docs', JSON.stringify(this.docs));
   }
   showdocInput: boolean = false;
 
   toggleCreatedocInput(): void {
    
     this.showdocInput = !this.showdocInput;
   }
 
 
   createdoc(): void {
     if (this.newdocName.trim() !== '') {
         const docNameLowercase = this.newdocName.toLowerCase(); 
 
         if (!this.isdocNameExists(docNameLowercase)) {
             const newdoc: doc = {
                 id: Date.now(),
                 name: this.newdocName,
                 media: [],
                 showContent: false
             };
             this.docs.push(newdoc);
             this.filtereddocs.push(newdoc);
             this.newdocName = '';
             this.savedocs();
         } else {
             alert('doc name already exists.');
         }
     }
     this.sortdocsAlphabetically();
 
 }
 sortdocsAlphabetically(): void {
   this.filtereddocs.sort((a, b) => a.name.localeCompare(b.name));
   localStorage.setItem('docs', JSON.stringify(this.filtereddocs));
 }
 
   
   isdocNameExists(name: string): boolean {
     const docNames = this.docs.map(doc => doc.name.toLowerCase()); 
     return docNames.includes(name.toLowerCase()); 
   }
   
   toggledoc(doc: doc): void {
     doc.showContent = !doc.showContent;
     this.savedocs();
   }
   noFileSelectedMessage: string = "No file selected";
   incorrectCodeMessage: string = "Incorrect code";
 
   addMedia(fileInput: HTMLInputElement, descriptionInput: HTMLInputElement, doc: doc): void {
   
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
           doc.media.push(newMedia);
           fileInput.value = ''; 
           descriptionInput.value = ''; 
           this.savedocs();
         };
         reader.readAsDataURL(file);
       } else {
         alert(this.noFileSelectedMessage);
       }
     }
 
   deleteMedia(doc: doc, media: contenu): void {
    
     if (confirm('Are you sure you want to delete this doc ?')) {
 
     const index = doc.media.indexOf(media);
     if (index !== -1) {
       doc.media.splice(index, 1);
       this.savedocs();
     }
   }}
 
 
   editdoc(doc: doc): void {
     
     const newName = prompt('Enter the new doc name:', doc.name);
     if (newName && newName.trim() !== '') {
       doc.name = newName.trim();
       
       this.filtereddocs = this.docs.filter(f => 
         f.name.toLowerCase().includes(this.searchdocName.toLowerCase())
       );
   
       this.docColumns = this.chunkArray(this.filtereddocs, 5);
   
       this.savedocs();
     }
   }
  
   
   editMedia(media: contenu): void {
   
     const newDescription = prompt(`Enter the new description for${media.name} :`, media.description);
     if (newDescription !== null) {
       media.description = newDescription.trim();
       this.savedocs();
     }
   }
 

 deletedoc(doc: doc): void {
 
     const index = this.docs.findIndex(f => f.id === doc.id);
     if (index !== -1) {
       this.docs.splice(index, 1);
       this.filtereddocs = this.docs.slice(); 
       this.savedocs(); 
     }
   } 
 
 
 
 
   filterByDescription(doc: doc): void {
     doc.media = doc.media.filter(media => media.description.includes(this.searchDescription));
   }
   
 
   filterByType(doc: doc, type: 'image' | 'video'): void {
     doc.media = doc.media.filter(media => media.type === type);
   }
 
  
   
     toggleAddFormVisibility(): void {
      
       this.showAddForm = !this.showAddForm;}
     
     
 
     showAddMediaForm: boolean = false;
 
 toggleAddMediaForm(): void {
 
   this.showAddMediaForm = !this.showAddMediaForm;}
  
 
 filter(): void {
   this.filtereddocs = this.docs.filter(doc => 
     doc.name.toLowerCase().includes(this.searchdocName.toLowerCase()) &&
     doc.media.some(media =>
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
   slogan: string = "Précision laser. Performance inégalée. Notre équipe, unie par la minutie, façonne l'excellence.";
   placeholderDescription: string = "Filtrer par description";
   placeholderdocName:string ="Filtrer par nom de dossier";
   allTypesOption: string = "Tous les types";
   nomboutton:string= "Créer";
   nomboutton2:string="filtrer";
   nomboutton3:string="Ajouter";
 
 translateToEnglish(): void {
     this.companyName = "Tunisian Boat Equipment Company";
     this.slogan = "Laser precision. Unmatched performance. Our team, united by meticulousness, shapes excellence.";
     this.placeholderDescription = "Filter by description";
     this.placeholderdocName = "Filter by folder name";
     this.allTypesOption = "All types";
     this.nomboutton="Create";
     this.nomboutton2="filter";
     this.nomboutton3="Add"
 
   }
 
  
   
 
 
   }
   
   
 
 
 
 