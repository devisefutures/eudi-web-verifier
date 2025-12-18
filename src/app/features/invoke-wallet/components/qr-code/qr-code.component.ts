import {ChangeDetectionStrategy, Component, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '@shared/shared.module';
import {interval, ReplaySubject, Subject, take, takeUntil} from 'rxjs';
import {map} from 'rxjs/operators';
import {NavigateService} from '@core/services/navigate.service';
import {DeviceDetectorService} from '@core/services/device-detector.service';
import {LocalStorageService} from '@core/services/local-storage.service';
import * as constants from '@core/constants/general';
import {ACTIVE_TRANSACTION} from '@core/constants/general';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {OpenLogsComponent} from '@shared/elements/open-logs/open-logs.component';
import {VerifierEndpointService} from "@core/services/verifier-endpoint.service";
import {WalletResponse} from "@core/models/WalletResponse";
import {ConcludedTransaction} from "@core/models/ConcludedTransaction";
import {QRCodeComponent} from 'angularx-qrcode';
import {SafeUrl} from "@angular/platform-browser";
import {ActiveTransaction} from "@core/models/ActiveTransaction";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {
  InitializedTransactionByReference,
  InitializedTransactionByValue,
} from '@app/core/models/InitializedTransaction';

@Component({
    selector: 'vc-qr-code',
    imports: [
        CommonModule,
        SharedModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        MatDividerModule,
        MatProgressBarModule,
        QRCodeComponent
    ],
    templateUrl: './qr-code.component.html',
    styleUrls: ['./qr-code.component.scss'],
    providers: [VerifierEndpointService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrCodeComponent implements OnInit, OnDestroy {

  private readonly deviceDetectorService!: DeviceDetectorService;
  private readonly localStorageService!: LocalStorageService;

  destroy$ = new Subject();
  stopPlay$ = new ReplaySubject(1);

  isCrossDevice = true;
  transaction!: ActiveTransaction;

  deepLinkTxt!: string;
  scheme!: string;
  qrCodeDownloadLink!: SafeUrl;
  readonly dialog!: MatDialog;

  @Output() transactionConcludedEvent = new EventEmitter<ConcludedTransaction>();

  emitTransactionConcludedEvent(concludedTransaction: ConcludedTransaction) {
    this.transactionConcludedEvent.emit(concludedTransaction);
  }

  constructor(
    private readonly verifierEndpointService: VerifierEndpointService,
    private readonly navigateService: NavigateService,
    private readonly injector: Injector,
  ) {
    this.deviceDetectorService = this.injector.get(DeviceDetectorService);
    this.localStorageService = this.injector.get(LocalStorageService);
    this.dialog = this.injector.get(MatDialog);
    this.isCrossDevice = this.deviceDetectorService.isDesktop();
  }

  ngOnInit(): void {
    this.transaction = JSON.parse(
      this.localStorageService.get(ACTIVE_TRANSACTION)!
    );
    if (!this.transaction) {
      this.navigateService.goHome();
    } else {
      if (this.localStorageService.get(constants.SCHEME)) {
        this.scheme =
          this.localStorageService.get(constants.SCHEME) ??
          this.transaction.initialization_request_state.scheme;
      } else {
        this.scheme = this.transaction.initialization_request_state.scheme;
      }

      if (
        this.transaction.initialization_request_state
          .transactionInitializationRequest.jar_mode === 'by_value'
      ) {
        this.deepLinkTxt = this.buildQrCode_by_value(
          (
            this.transaction
              .initialized_transaction as InitializedTransactionByValue
          ).request
        );
      } else if (
        this.transaction.initialization_request_state
          .transactionInitializationRequest.jar_mode === 'by_reference'
      ) {
        this.deepLinkTxt = this.buildQrCode_by_reference(
          this.transaction
            .initialized_transaction as InitializedTransactionByReference
        );
      }

      if (this.isCrossDevice) {
        this.pollingRequest(this.transaction.initialized_transaction.transaction_id);
      }
    }
  }

  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }

  private pollingRequest(transaction_id: string) {
    const source = interval(2000);
    source
      .pipe(
        takeUntil(this.stopPlay$),
        take(60)
      )
      .subscribe(() => {
        this.verifierEndpointService.getWalletResponse(transaction_id)
          .pipe(
            takeUntil(this.stopPlay$),
            map((data) => data as WalletResponse),
          )
          .subscribe(
            (res: WalletResponse) => {
              this.stopPlay$.next(1);
              let concludedTransaction = this.concludeTransaction(res);
              this.emitTransactionConcludedEvent(concludedTransaction)
            },
          );
      });
  }

  private concludeTransaction(response: WalletResponse): ConcludedTransaction {
    let concludedTransaction = {
      transactionId: this.transaction.initialized_transaction.transaction_id,
      presentationQuery:
        this.transaction.initialization_request_state
          .transactionInitializationRequest!!.dcql_query,
      walletResponse: response,
      nonce:
        this.transaction.initialization_request_state
          .transactionInitializationRequest.nonce,
    };
    // Clear local storage
    this.localStorageService.remove(constants.ACTIVE_TRANSACTION);

    return concludedTransaction;
  }

  private buildQrCode_by_reference(data: {
    client_id: string;
    request_uri: string;
    request_uri_method: 'get' | 'post';
    transaction_id: string;
  }): string {
    return `${this.scheme}?client_id=${encodeURIComponent(
      data.client_id
    )}&request_uri=${encodeURIComponent(
      data.request_uri
    )}&request_uri_method=${encodeURIComponent(data.request_uri_method)}`;
  }

  private buildQrCode_by_value(token: string): string {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token does not have the expected 3 parts');
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);

    const request_new = `${this.scheme}?response_type=${
      parsed.response_type
    }&response_mode=${
      parsed.response_mode
    }&client_id=redirect_uri${encodeURIComponent(
      ':' + parsed.response_uri
    )}&response_uri=${encodeURIComponent(
      parsed.response_uri
    )}&dcql_query=${encodeURIComponent(
      JSON.stringify(parsed.dcql_query)
    )}&nonce=${parsed.nonce}&state=${parsed.state}`;

    return request_new;
  }

  openLogs() {
    this.dialog.open(OpenLogsComponent, {
      data: {
        transactionId: this.transaction.initialized_transaction.transaction_id,
        label: 'Show Logs',
        isInspectLogs: false
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
    this.stopPlay$.next('');
    this.stopPlay$.complete();
  }
}
