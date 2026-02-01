from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import BorrowedBook

@receiver(post_save, sender=BorrowedBook)
def update_book_availability(sender, instance, created, **kwargs):
    book = instance.book
    
    # Count active loans (not returned)
    active_loans = book.borrowed_records.filter(is_returned=False).count()
    
    # Check if we have available copies
    # If active loans are less than total quantity, at least one copy is available
    if active_loans < book.quantity:
        book.is_available = True
    else:
        book.is_available = False
        
    book.save()
