// Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

# This module handles the product consumption subscription process and license retrieval.
#
# + payload - Project status request containing email, deploymentId, and projectId
# + return - License details or error
public isolated  function downloadLicense(LicenseDownloadPayload payload) returns License|error {

    // 1. Get current status
    Result statusRes =
        check productConsumptionClient->/projects/[payload.projectId]/consumption/status
            .post({
                email: payload.email,
                deploymentId: payload.deploymentId
            });


    int status = statusRes.result.status;
    string? applicationId = statusRes.result.applicationId;
    string? applicationName = statusRes.result.name;
    string? applicationDescription = statusRes.result.description;

    // CREATE APPLICATION
    if status == 1  {
        ApplicationCreateResponse app =
            check productConsumptionClient->/applications
                .post({name: applicationName, description: applicationDescription});

        applicationId = app.applicationId;

        Result _ = check productConsumptionClient->/projects/[payload.projectId]
            .patch({
                status: 2,
                applicationId: applicationId
            });

        status = 2;
    }
    if applicationId is () {
        return error("Application ID is required.");
    }

    if (status == 2 ) {
        ApplicationSubscriptionResponse _ = check productConsumptionClient->/applications/[applicationId]/subscribe
            .post(<ApplicationSubscriptionPayload>{
            applicationId: applicationId
        });

        Result _ = check productConsumptionClient->/projects/[payload.projectId]
            .patch({
                status: 3
            });

        status = 3;
    }

    // GENERATE CREDENTIALS
    if (status == 3) {
        ApplicationKeyGenerationResponse creds =
            check productConsumptionClient->/applications/[applicationId]/generate\-credentials.post({});

        Result _ = check productConsumptionClient->/projects/[payload.projectId]
            .patch({
                status: 4,
                consumerKey: creds.consumerKey,
                consumerSecret: creds.consumerSecret
            });

        status = 4;
    }

    // GENERATE SECRET KEYS
    if status == 4 {
        SecretKeysResponse keys =
            check productConsumptionClient->/generate\-secret\-keys.post({});

        Result _ = check productConsumptionClient->/projects/[payload.projectId]
            .patch({
                status: 5,
                primarySecretKey: keys.primarySecretKey,
                secondarySecretKey: keys.secondarySecretKey
            });

        status = 5;
    }

    // DOWNLOAD LICENSE
    if status == 5 {
        LicenseResponse license =
            check productConsumptionClient->/projects/[payload.projectId]/deployments/[payload.deploymentId]/license
                .post(
                    {
                        email: payload.email
                    }
                    );

        License licenseData = license.result.license;
        return licenseData;
    }
    return  error("Unexpected application status: " + status.toString());
}
