/**
 * CloudNote
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { UserResource } from './userResource';

export interface NoteResource { 
    id: any;
    title: any;
    content: any;
    user?: UserResource;
    isPublic: any;
    createdAt: any;
    updatedAt: any;
}