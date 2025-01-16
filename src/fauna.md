# FAUNA.JS MODULE

## DB.user | Returns just the result
##### DB.user.create | EMAIL PASSWORD
##### DB.user.get | EMAIL
##### DB.user.update | EMAIL UPDATES
##### DB.user.exists | EMAIL
##### DB.user.delete | EMAIL

## DB.u | Returns the result.data
##### DB.user.create | EMAIL PASSWORD => DOCUMENT
##### DB.user.get | EMAIL => DOCUMENT
##### DB.user.update | EMAIL UPDATES => DOCUMENT
##### DB.user.exists | EMAIL => BOOLEAN
##### DB.user.delete | EMAIL => NULL

## DB.runQ | Runs FQL queries, returns raw result