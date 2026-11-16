import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-success',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './contact-success.component.html',
  styleUrl: './contact-success.component.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ContactSuccessComponent implements OnInit, OnDestroy {
  secondsRemaining = 7;
  private countdown?: ReturnType<typeof setInterval>;
  private redirecting = false;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.countdown = setInterval(() => {
      this.secondsRemaining -= 1;
      if (this.secondsRemaining === 0) this.goHome();
    }, 1000);
  }

  goHome(): void {
    if (this.redirecting) return;
    this.stopCountdown();
    this.redirecting = true;
    // Router navigation keeps the Angular app and selected language loaded.
    void this.router.navigate(['/home']).then(navigated => {
      // Keep the fallback button usable if navigation is cancelled or fails.
      if (!navigated) this.redirecting = false;
    }, () => { this.redirecting = false; });
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  private stopCountdown(): void {
    if (this.countdown !== undefined) {
      clearInterval(this.countdown);
      this.countdown = undefined;
    }
  }
}
