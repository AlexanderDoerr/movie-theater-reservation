from google.protobuf import timestamp_pb2 as _timestamp_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class OrderIn(_message.Message):
    __slots__ = ["date_created", "payment_method", "ticket_uuid", "userid", "uuid"]
    DATE_CREATED_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_METHOD_FIELD_NUMBER: _ClassVar[int]
    TICKET_UUID_FIELD_NUMBER: _ClassVar[int]
    USERID_FIELD_NUMBER: _ClassVar[int]
    UUID_FIELD_NUMBER: _ClassVar[int]
    date_created: _timestamp_pb2.Timestamp
    payment_method: PaymentMethod
    ticket_uuid: _containers.RepeatedScalarFieldContainer[str]
    userid: str
    uuid: str
    def __init__(self, uuid: _Optional[str] = ..., userid: _Optional[str] = ..., ticket_uuid: _Optional[_Iterable[str]] = ..., payment_method: _Optional[_Union[PaymentMethod, _Mapping]] = ..., date_created: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class OrderOut(_message.Message):
    __slots__ = ["date_created", "payment_method", "ticket_uuid", "userid"]
    DATE_CREATED_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_METHOD_FIELD_NUMBER: _ClassVar[int]
    TICKET_UUID_FIELD_NUMBER: _ClassVar[int]
    USERID_FIELD_NUMBER: _ClassVar[int]
    date_created: _timestamp_pb2.Timestamp
    payment_method: PaymentMethod
    ticket_uuid: _containers.RepeatedScalarFieldContainer[str]
    userid: str
    def __init__(self, userid: _Optional[str] = ..., ticket_uuid: _Optional[_Iterable[str]] = ..., payment_method: _Optional[_Union[PaymentMethod, _Mapping]] = ..., date_created: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class Orderid(_message.Message):
    __slots__ = ["uuid"]
    UUID_FIELD_NUMBER: _ClassVar[int]
    uuid: str
    def __init__(self, uuid: _Optional[str] = ...) -> None: ...

class PaymentMethod(_message.Message):
    __slots__ = ["ccNum", "cvv", "expDate", "name"]
    CCNUM_FIELD_NUMBER: _ClassVar[int]
    CVV_FIELD_NUMBER: _ClassVar[int]
    EXPDATE_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    ccNum: str
    cvv: str
    expDate: str
    name: str
    def __init__(self, ccNum: _Optional[str] = ..., expDate: _Optional[str] = ..., cvv: _Optional[str] = ..., name: _Optional[str] = ...) -> None: ...

class PaymentType(_message.Message):
    __slots__ = ["type"]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    type: str
    def __init__(self, type: _Optional[str] = ...) -> None: ...

class Ticket(_message.Message):
    __slots__ = ["MovieTime", "Movieuuid", "seat_number", "theater_room"]
    MOVIETIME_FIELD_NUMBER: _ClassVar[int]
    MOVIEUUID_FIELD_NUMBER: _ClassVar[int]
    MovieTime: str
    Movieuuid: str
    SEAT_NUMBER_FIELD_NUMBER: _ClassVar[int]
    THEATER_ROOM_FIELD_NUMBER: _ClassVar[int]
    seat_number: str
    theater_room: int
    def __init__(self, Movieuuid: _Optional[str] = ..., theater_room: _Optional[int] = ..., MovieTime: _Optional[str] = ..., seat_number: _Optional[str] = ...) -> None: ...

class Userid(_message.Message):
    __slots__ = ["uuid"]
    UUID_FIELD_NUMBER: _ClassVar[int]
    uuid: str
    def __init__(self, uuid: _Optional[str] = ...) -> None: ...
