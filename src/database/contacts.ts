import { v4 as uuid } from "uuid";
import {
  ScanCommand,
  UpdateCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommandOutput,
  QueryCommand,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { Contact } from "../types";

const ddb = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(ddb);
const TableName = "ContactsTableV2";

export async function createContact(contact: Contact): Promise<Contact> {
  try {
    const command = new PutCommand({
      TableName,
      Item: { ...contact },
    });
    await docClient.send(command);
    return contact;
  } catch (error) {
    throw error;
  }
}

export async function updateContact(contact: Contact): Promise<Contact> {
  try {
    const command = new UpdateCommand({
      TableName,
      Key: {
        ContactId: contact.ContactId,
        UserEmail: contact.UserEmail,
      },
      UpdateExpression:
        "SET #Name = :Name, #Email = :Email, #Phone = :Phone, #Owing = :Owing",
      ExpressionAttributeNames: {
        "#Name": "Name",
        "#Email": "Email",
        "#Phone": "Phone",
        "#Owing": "Owing",
      },
      ExpressionAttributeValues: {
        ":Name": contact.Name,
        ":Email": contact.Email,
        ":Phone": contact.Phone,
        ":Owing": contact.Owing,
      },
      ReturnValues: ReturnValue.UPDATED_NEW,
    });

    const result = await docClient.send(command);
    return result.Attributes as Contact;
  } catch (error) {
    throw error;
  }
}

export async function deleteContact(
  ContactId: string,
  UserEmail: any
): Promise<void> {
  const params = {
    TableName,
    Key: {
      ContactId: ContactId,
      UserEmail: UserEmail,
    },
  };

  try {
    const command = new DeleteCommand(params);
    await docClient.send(command);
  } catch (error) {
    throw error;
  }
}

export async function listContacts(): Promise<Contact[]> {
  const params = {
    TableName,
  };

  try {
    const command = new ScanCommand(params);
    const data: ScanCommandOutput = await docClient.send(command);
    return (data.Items || []) as Contact[];
  } catch (error) {
    throw error;
  }
}

export async function getContact(
  ContactId: string,
  UserEmail: string
): Promise<Contact | null> {
  const params = {
    TableName,
    KeyConditionExpression: "ContactId = :contactId AND UserEmail = :userEmail",
    ExpressionAttributeValues: {
      ":contactId": ContactId,
      ":userEmail": UserEmail,
    },
  };

  try {
    const command = new QueryCommand(params);
    const data: QueryCommandOutput = await docClient.send(command);

    if (data.Items && data.Items.length > 0) {
      return data.Items[0] as Contact;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
}


export async function getExistingContactByEmail(
  Email: string,
  UserEmail: string
): Promise<Contact | null> {
  const params = {
    TableName,
    IndexName: "UserEmail-Email-Index",
    KeyConditionExpression: "UserEmail = :userEmail AND Email = :email",  
    ExpressionAttributeValues: {
      ":userEmail": Email,
      ":email": UserEmail,
    },
  };

  console.log("getExistingContactByEmail Parameters:", params);

  try {
    const command = new QueryCommand(params);
    const data: QueryCommandOutput = await docClient.send(command);

    console.log("getExistingContactByEmail Result:", data);

    if (data.Items && data.Items.length > 0) {
      console.log("getExistingContactByEmail Found:", data.Items[0]);
      return data.Items[0] as Contact;
    } else {
      console.log("getExistingContactByEmail Not Found");
      return null;
    }
  } catch (error) {
    console.error("getExistingContactByEmail Error:", error);
    throw error;
  }
}
export async function updateExistingContact(
  ContactId: string,
  updatedFields: Partial<
    Pick<Contact, "Owing" | "Name" | "Email" | "Phone" | "UserEmail">
  >
): Promise<Contact | null> {
  console.log("Update operation parameters:", { ContactId, updatedFields });

  const params = {
    TableName,
    Key: {
      ContactId: ContactId,
    },
    UpdateExpression:
      "SET #Owing = :Owing, #Name = :Name, #Email = :Email, #Phone = :Phone",
    ExpressionAttributeNames: {
      "#Owing": "Owing",
      "#Name": "Name",
      "#Email": "Email",
      "#Phone": "Phone",
    },
    ExpressionAttributeValues: {
      ":Owing": updatedFields.Owing,
      ":Name": updatedFields.Name,
      ":Email": updatedFields.Email,
      ":Phone": updatedFields.Phone,
    },
    ReturnValues: ReturnValue.ALL_NEW,
  };

  try {
    const command = new UpdateCommand(params);
    const data: any = await docClient.send(command);
    console.log("Update successful. Updated contact:", data.Attributes);
    return data.Attributes as Contact;
  } catch (error) {
    console.error("Error updating contact:", error);
    console.log("Input parameters:", { ContactId, updatedFields });
    console.log("ExpressionAttributeValues:", params.ExpressionAttributeValues);
    console.log("ExpressionAttributeNames:", params.ExpressionAttributeNames);

    throw error;
  }
}

const table = {
  id: "", // PK, Current/active user id
  contactId: "", // SK, cognito id of other person, or uuid of other person
};
