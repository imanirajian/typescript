// app.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AddressSearch } from './shared/components/address-search/address-search';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AddressSearch],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}