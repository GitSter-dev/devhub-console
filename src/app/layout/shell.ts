import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SessionStore } from '../session/session-store';
import { ThemeService } from './theme';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class ShellComponent {
  protected readonly session = inject(SessionStore);
  protected readonly theme = inject(ThemeService);

  protected readonly links = [
    { path: '/cases', label: 'Queue', icon: 'pi pi-flag' },
    { path: '/audit', label: 'Audit log', icon: 'pi pi-history' },
    { path: '/users', label: 'Users', icon: 'pi pi-users' },
    { path: '/stats', label: 'Stats', icon: 'pi pi-chart-bar' },
  ];
}
