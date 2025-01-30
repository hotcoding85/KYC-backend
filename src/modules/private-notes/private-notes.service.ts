import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PrivateNotes } from './entity/private-notes.entity';
import { Repository } from 'typeorm';
import { CreatePrivateNoteDto } from './dto/create-private-note.dto';
import { EditPrivateNoteDto } from './dto/edit-private-note.dto';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PrivateNotesService {
  constructor(
    @InjectRepository(PrivateNotes)
    private privateNotesRepository: Repository<PrivateNotes>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: number, createPrivateNoteDto: CreatePrivateNoteDto) {
    const company = await this.companyRepository.findOne({
      where: {
        company_id: createPrivateNoteDto.companyId,
      },
    });
    if (!company) {
      throw new NotFoundException(
        `company with company id ${createPrivateNoteDto.companyId} doesnot exists`,
      );
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException(`user with user id ${userId} doesnot exists`);
    }
    const newNote = this.privateNotesRepository.create({
      content: createPrivateNoteDto.content,
      user: user,
      company: company,
    });
    return await this.privateNotesRepository.save(newNote);
  }

  async findOne(companyId: string, userId: number) {
    const note = await this.privateNotesRepository.findOne({
      where: {
        user: { id: userId },
        company: {
          company_id: companyId,
        },
      },
    });
    if (!note) {
      return {result: null}
    }
    return note;
  }

  async findOneByNoteId(noteId: string, userId: number) {
    const note = await this.privateNotesRepository.findOne({
      where: {
        user: { id: userId },
        private_note_id: noteId
      },
    });
    if (!note) {
      throw new NotFoundException(
        `Private note with note id ${noteId} and user Id ${userId} not found`,
      );
    }
    return note;
  }

  async update(
    privateNoteId: string,
    userId: number,
    updatePrivateNoteDto: EditPrivateNoteDto,
  ) {
    const note = await this.privateNotesRepository.findOne({
      where: {
        private_note_id: privateNoteId,
      },
    });

    if (!note) {
      throw new NotFoundException(`no note exists with id ${privateNoteId}`);
    }
    Object.assign(note, updatePrivateNoteDto);
    return await this.privateNotesRepository.save(note);
  }

  async remove(privateNoteId: string, userId: number) {
    const note = await this.findOneByNoteId(privateNoteId, userId);
    return await this.privateNotesRepository.remove(note);
  }

  async createOrUpdateForCOmpany(
    companyId: string,
    userId: number,
    updatePrivateNoteDto: EditPrivateNoteDto,
  ) {
    const company = await this.companyRepository.findOne({
      where: {
        company_id: companyId,
      },
      relations: {
        privateNotes: true,
      },
    });

    if (!company) {
      throw new NotFoundException(
        `company with id ${companyId} does not exists`,
      );
    }
    const fetchedProvateNote = company.privateNotes?.[0];

    if (fetchedProvateNote) {
      const noteToBeUpdated = await this.privateNotesRepository.findOne({
        where: {
          private_note_id: fetchedProvateNote.private_note_id,
        },
      });

      noteToBeUpdated.content = updatePrivateNoteDto.content;
      return await this.privateNotesRepository.save(noteToBeUpdated);
    } else {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new NotFoundException(
          `user with user id ${userId} doesnot exists`,
        );
      }
      const newNote = this.privateNotesRepository.create({
        content: updatePrivateNoteDto.content,
        user: user,
        company: company,
      });
      return await this.privateNotesRepository.save(newNote);
    }
  }
}
