import { Expose, Transform, Type } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class AppointmentServiceResponse {
  @Expose()
  id: string;

  @Expose()
  serviceId: string;

  @Expose()
  @Transform(({ obj }) => obj.service?.name || '')
  serviceName: string;

  @Expose()
  price: number;

  @Expose()
  duration: number;

  @Expose()
  notes: string;
}

export class AppointmentResponse {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  @Transform(({ obj }) =>
    obj.stylist ? `${obj.stylist.firstName} ${obj.stylist.lastName}` : '',
  )
  stylistName: string;

  @Expose()
  branchId: string;

  @Expose()
  @Transform(({ obj }) => obj.branch?.name || '')
  branchName: string;

  @Expose()
  @Type(() => AppointmentServiceResponse)
  @Transform(({ obj }) => obj.appointmentServices || [])
  services: AppointmentServiceResponse[];

  @Expose()
  startTime: string;

  @Expose()
  durationMinutes: number;

  @Expose()
  appointmentDate: Date;

  @Expose()
  totalAmount: number;

  @Expose()
  discountAmount: number;

  @Expose()
  finalAmount: number;

  @Expose()
  status: string;

  @Expose()
  notes: string;

  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  createdAt: Date;

  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  updatedAt: Date;
}

export class Appointments extends PaginationResponse<AppointmentResponse> {}
