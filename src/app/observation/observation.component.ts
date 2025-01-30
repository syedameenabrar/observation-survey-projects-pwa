import { Component, ViewEncapsulation } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert/alert.service';
import { isDeactivatable } from './../services/guard/guard.service';
import { environment } from 'src/environments/environment';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { UtilService } from 'src/app/services/util/util.service';
import { fromEvent, map, merge, startWith } from 'rxjs';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-observation',
  templateUrl: './observation.component.html',
  styleUrls: ['./observation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ObservationComponent implements isDeactivatable {
  apiConfig: any = {};
  isDirty: boolean = false;
  saveQuestioner: boolean = false;
  showDetails = false;
  isOnline: any;
  onlineStatus: boolean = true;
  hasSessionList: boolean = false;

  constructor(private navCtrl: NavController, private profileService: ProfileService,
    private utils: UtilService, private toast: ToastService,
    private alertService: AlertService) { }

  ionViewWillEnter() {
    this.toast.dismissToast();
    this.getOnlineStatus();
    this.windowEventListner();
  }

  ionViewWillLeave() {
    if (this.alertService.alert) {
      this.alertService.dismissAlert();
    }
  }

  async canPageLeave(): Promise<boolean> {
      this.isDirty = false;
      this.navCtrl.back();
      return true;
  }

  getProfileDetails() {
    if (!this.utils.isLoggedIn()) {
      this.showDetails = true
      return
    }
    this.profileService.getProfileAndEntityConfigData().subscribe((mappedIds) => {
      if (mappedIds) {
        const mappedIdsString = JSON.stringify(mappedIds) || "";
        localStorage.setItem("profileData", mappedIdsString);
        let storedProfileData: any = localStorage.getItem('profileData');
        this.apiConfig['profileData'] = JSON.parse(storedProfileData);;
        this.apiConfig['baseURL'] = environment.surveyBaseURL ?? environment.baseURL;
        this.apiConfig['userAuthToken'] = localStorage.getItem('accToken');
        this.apiConfig['solutionType'] = "observation";
        this.apiConfig['fileSizeLimit'] = 50;
        this.showDetails = true
      }
    });
  }

  getOnlineStatus() {
    const onlineEvent = fromEvent(window, 'online').pipe(map(() => true));
    const offlineEvent = fromEvent(window, 'offline').pipe(map(() => false));
    merge(onlineEvent, offlineEvent).pipe(startWith(navigator.onLine)).subscribe((isOnline: any) => {
      this.onlineStatus = isOnline;
      if (!this.onlineStatus) {
        this.showDetails = true;
      } else {
        this.getProfileDetails()
      }
    });
  }

  windowEventListner() {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'formDirty') {
        this.isDirty = event.data.isDirty;
      }
    });
  }
}