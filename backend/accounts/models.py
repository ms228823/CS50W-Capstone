from django.db import models
from django.contrib.auth.models import AbstractUser
# from django.contrib.auth.hashers import make_password, check_password
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES = [
        ("super_admin", "Super Admin"),
        ("admin", "Admin"),
        ("viewer", "Viewer"),
        ("tester", "Tester"),
        ("seller", "Seller"),
    ]
    
    STATUS_CHOICES = [
        ("working","Working"),
        ("on_hold", "On Hold"),
        ("blocked", "Blocked")
    ]

    role = models.CharField(max_length=100, choices=ROLE_CHOICES)
    failed_logins = models.IntegerField(default=0)
    phone_number = PhoneNumberField(null=False, blank=False, unique=True)
    is_verified = models.BooleanField(default=False)
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default="working")
    notes_on_activity = models.TextField(blank=True, default="")
    last_time_access = models.DateTimeField(auto_now=True)
    # password = models.CharField(max_length=500)
    
    # def check_password(self, entered_password):
        
    #     return check_password(entered_password, self.password)
    
    def check_failed_logins(self):
        
        if self.failed_logins >= 3 and self.failed_logins < 5:
            
            self.status = "on_hold"
            
            notes = self.notes_on_activity
            
            print(f"User on hold due to {notes}")
            return False
        
        
        elif self.failed_logins >= 5:
            self.status = "blocked"
            
            notes = self.notes_on_activity
            
            print(f"User is blocked due to {notes}")
            return False
        
        else:
            self.status = "working"
            
            notes = self.notes_on_activity
            
            if notes:
                print(f"User is working with note on his activity {notes}")
                return True
            else:
            
                print("User is working with no notes on his activity")
                return True
            
    