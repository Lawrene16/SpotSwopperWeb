import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)},
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'history', loadChildren: './history/history.module#HistoryPageModule' },
  { path: 'referrals', loadChildren: './referrals/referrals.module#ReferralsPageModule' },
  { path: 'myaccount', loadChildren: './myaccount/myaccount.module#MyaccountPageModule' },
  { path: 'register', loadChildren: './register/register.module#RegisterPageModule' },
  { path: 'listspot', loadChildren: './listspot/listspot.module#ListspotPageModule' },
  { path: 'purchasespot', loadChildren: './purchasespot/purchasespot.module#PurchasespotPageModule' },
  { path: 'help', loadChildren: './help/help.module#HelpPageModule' },
  { path: 'withdrawal', loadChildren: './withdrawal/withdrawal.module#WithdrawalPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
