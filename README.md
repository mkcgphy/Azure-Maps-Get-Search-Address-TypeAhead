Azure Maps Search Control

A PCF control for Address Type Ahead using Azure Maps Search Rest API calls either using AJAX or using Custom Action

Set Up:
Download the solution and import in your environment. 

Following steps needs to be completed:

1. Double click on field for which address type ahead needs to be implemented.
2. Add the AddressTypeAhead control 
3. Bind the properties for all the controls. Use the following link to correct the bound properties:
    https://www.magnetismsolutions.com/blog/jaredjohnson/2019/07/04/binding-to-address-fields-in-a-pcf-control
    
    Subscription Key is mandatory for the control to work. In case of Ajax Call action name can be provided any value of your choice otherwise it should be name of your custom action. 

4. Currently it is configured to work for Ajax calls. For custom action please update the file using comments part.
5. At this point you need to add dummy value to ActionName , Minlength = 8 .
