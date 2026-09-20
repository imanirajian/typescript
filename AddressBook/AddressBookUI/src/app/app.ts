import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AddressLookup } from './features/address/feature/address-lookup/address-lookup';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AddressLookup],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
