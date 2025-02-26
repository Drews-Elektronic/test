import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';

import { environment } from '../../../../environments/environment';

import { MitteilungService } from 'src/app/services/mitteilung.service';

@Component({
  selector: 'mpl-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


export class LoginComponent {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private backendService: BackendService,
    private mitteilungService: MitteilungService,
    ) { }

  ngOnInit(){
    // Extrahiere aus der URL den Token
    /*
    this.activatedRoute.queryParams.subscribe(params => {
      
      const viewaction = params['viewaction'];
      const wordpressToken = params['token'];

      if(viewaction == "kunde:login"){
        localStorage.setItem("token", wordpressToken);

        let subscription = this.backendService.loginkd(wordpressToken).subscribe((value) => {
          subscription.unsubscribe();
          if (value === false) {
            //! Fehlermeldung
            console.log('Login Fehler');
            this.mitteilungService.createMessage("Etwas ist bei der schiefgegangen. \n Sie werden wieder zum Login zurückgeleitet.", "warning")

            setTimeout(()=>{
              window.location.href = environment.wordpressLoginUrl;
            }, 2000)
          } else {
            localStorage.setItem("timestamp", value.timestamp);
            localStorage.setItem("kdnr", value.kundennr);

            this.router.navigate([environment.mplUrl]); ?
          }
        });
      }
    });
    */
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }
}
