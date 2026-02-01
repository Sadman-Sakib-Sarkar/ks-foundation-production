from rest_framework import serializers
from .models import Book, BorrowedBook
import datetime

class BorrowedBookSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_serial = serializers.CharField(source='book.serial_number', read_only=True)

    class Meta:
        model = BorrowedBook
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    active_loan = serializers.SerializerMethodField()

    def get_active_loan(self, obj):
        # Return the most recent loan if it's not returned
        loan = obj.borrowed_records.filter(is_returned=False).first()
        if loan:
            return BorrowedBookSerializer(loan).data
        return None

    class Meta:
        model = Book
        fields = '__all__'
