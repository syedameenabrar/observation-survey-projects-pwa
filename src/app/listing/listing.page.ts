import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { UrlConfig } from 'src/app/interfaces/main.interface';
import urlConfig from 'src/app/config/url.config.json';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiBaseService } from '../services/base-api/api-base.service';
import { LoaderService } from '../services/loader/loader.service';
import { ToastService } from '../services/toast/toast.service';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-listing',
  templateUrl: './listing.page.html',
  styleUrls: ['./listing.page.scss'],
})
export class ListingPage implements OnInit {
  listData: any;
  baseApiService: any;
  loader: LoaderService;
  solutionId!: string;
  listType!: keyof UrlConfig;
  listTitle!: string;
  listDescription!: string;
  searchTerm: any = "";
  toastService: ToastService;
  stateData: any;
  page:number = 1

  constructor(private http: HttpClient, private navCtrl: NavController, private router: Router) {
    this.baseApiService = inject(ApiBaseService);
    this.loader = inject(LoaderService)
    this.toastService = inject(ToastService)
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.stateData = navigation.extras.state;
      console.log('statee', this.stateData);
      this.listTitle = this.stateData?.name;
      this.listDescription = this.stateData?.description;
      this.listType = this.stateData?.listType;
      this.getListData();
    }
  }

  handleInput(event: any) {
    this.searchTerm = event.target.value;
    this.getListData();
  }

  getListData() {
    this.loader.showLoading("Please wait while loading...");
    this.baseApiService
      .post(
        urlConfig[this.listType].listingUrl + `?page=${this.page}&limit=10&filter=createdByMe&search=${this.searchTerm}`)
      .subscribe((res: any) => {
        this.loader.dismissLoading();
        if (res?.message == "Successfully fetched projects") {
          this.listData = res?.result
        } else {
          this.toastService.presentToast("Error");
        }
      },
        (err: any) => {
          this.loader.dismissLoading();
          this.toastService.presentToast(err?.error?.message);
        }
      );
  }

  loadData(){
    this.page = this.page+1;
    this.getListData();
  }

  goBack() {
    this.navCtrl.back();
  }
}