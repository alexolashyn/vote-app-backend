import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateOrgDto } from '../dtos/create-org.dto';
import { AdminGuard } from '../guards/admin.guard';
import { MembershipGuard } from '../guards/membership.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {
  }

  @Post()
  createOrganization(@Body() body: CreateOrgDto, @Request() req) {
    const { email, id } = req.user;
    return this.organizationsService.createOrganization(body.name, [...body.members, email], id);
  }

  @Get()
  getOrganizations(@Request() req) {
    const { id } = req.user;
    return this.organizationsService.getUserOrganizations(id);
  }

  @Get(':orgId')
  @UseGuards(MembershipGuard)
  getOrganizationById(@Param('orgId') id: number) {
    return this.organizationsService.getOrganizationById(id);
  }

  @Post(':orgId/key')
  @UseGuards(MembershipGuard)
  async generateKey(@Param('orgId') orgId: number) {
    return this.organizationsService.generateKey(orgId);
  }

  @Post('request')
  async sendRequest(@Request() req, @Body('key') key: string) {
    if (!key) {
      throw new BadRequestException('Key is required!');
    }

    const { user } = req;

    return this.organizationsService.sendRequest(user, key);
  }

  @Post(':orgId/requests/:requestId/:action(approve|reject)')
  @UseGuards(AdminGuard)
  async handleRequest(
    @Param('requestId') requestId: number,
    @Param('orgId') orgId: number,
    @Param('action') action: string,
  ) {
    const isApprove = action === 'approve';
    return this.organizationsService.handleJoinRequest(orgId, requestId, isApprove);
  }


  @Get(':orgId/members')
  @UseGuards(MembershipGuard)
  async getOrganizationMembers(@Param('orgId') orgId: number, @Request() req) {
    if (req.isCreatorAdmin) {
      return this.organizationsService.getMembersAndRequests(orgId);
    }
    return this.organizationsService.getMembers(orgId);
  }
}