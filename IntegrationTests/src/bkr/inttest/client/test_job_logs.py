
import unittest
from turbogears.database import session
from bkr.inttest import data_setup, get_server_base, with_transaction
from bkr.inttest.client import run_client

class JobLogsTest(unittest.TestCase):

    @with_transaction
    def setUp(self):
        self.job = data_setup.create_completed_job()

    def test_by_job(self):
        out = run_client(['bkr', 'job-logs', self.job.t_id])
        logs = out.splitlines()
        self.assert_(logs[0].startswith(get_server_base()), logs[0])
        self.assert_(logs[0].endswith('dummy.txt'), logs[0])
        self.assert_(logs[1].startswith(get_server_base()), logs[0])
        self.assert_(logs[1].endswith('dummy.txt'), logs[0])

    def test_by_recipeset(self):
        out = run_client(['bkr', 'job-logs', self.job.recipesets[0].t_id])
        logs = out.splitlines()
        self.assert_(logs[0].startswith(get_server_base()), logs[0])
        self.assert_(logs[0].endswith('dummy.txt'), logs[0])
        self.assert_(logs[1].startswith(get_server_base()), logs[0])
        self.assert_(logs[1].endswith('dummy.txt'), logs[0])

    def test_by_recipe(self):
        out = run_client(['bkr', 'job-logs',
                self.job.recipesets[0].recipes[0].t_id])
        logs = out.splitlines()
        self.assert_(logs[0].startswith(get_server_base()), logs[0])
        self.assert_(logs[0].endswith('dummy.txt'), logs[0])
        self.assert_(logs[1].startswith(get_server_base()), logs[0])
        self.assert_(logs[1].endswith('dummy.txt'), logs[0])