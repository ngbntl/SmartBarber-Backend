import { Expose, Transform } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

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
  timeSlotId: string;

  @Expose()
  appointmentDate: Date;

  @Expose()
  status: string;

  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  createdAt: Date;

  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  updatedAt: Date;
}

export class Appointments extends PaginationResponse<AppointmentResponse> {}
